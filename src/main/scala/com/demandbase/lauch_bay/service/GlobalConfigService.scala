package com.demandbase.lauch_bay.service

import cats.implicits.toShow
import com.demandbase.lauch_bay.domain.GlobalConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.types.IntVersion
import com.demandbase.lauch_bay.trace.{log, Ctx}
import io.circe.{parser, Json}
import io.circe.syntax.EncoderOps
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.s3.model.S3Exception
import zio.{IO, _}
import zio.s3.{S3, UploadOptions}
import zio.stream.{ZSink, ZStream}

trait GlobalConfigService {
  def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, GlobalConfigDetails]
  def get()(implicit ctx: Ctx): Task[GlobalConfigDetails]
}
object GlobalConfigService extends Accessible[GlobalConfigService]

case class GlobalConfigServiceLive(ref: Ref[GlobalConfigDetails]) extends GlobalConfigService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, GlobalConfigDetails] = {
    for {
      updated <- ref.modify(cur => if (cur.version == cmd.version) (true, cmd.copy(version = cur.version.inc)) else (false, cur))
      res <- if (updated) ref.get
             else
               ref.get.flatMap { sv =>
                 log.info(s"upsert global config fail server version:[$sv], cmd version:[${cmd.version}]")
               } *> IO.fail(EntryModifiedError("Global Config"))
      _ <- log.info(s"upsert global config, new version: ${res.version}, upsert cmd: ${cmd.show}")
    } yield res
  }
  override def get()(implicit ctx: Ctx): Task[GlobalConfigDetails] = {
    ref.get
  }
}

object GlobalConfigServiceLive {
  val layer = (for {
    ref <- Ref.makeManaged(GlobalConfigDetails(List.empty, List.empty, IntVersion(0)))
  } yield GlobalConfigServiceLive(ref)).toLayer[GlobalConfigService]
}

case class GlobalConfigServiceS3Live(s3: S3.Service) extends GlobalConfigService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  private val bucketName = "config-store"

  private val key = "config"

  private val defaultConfig = GlobalConfigDetails(List.empty, List.empty, IntVersion(0))

  implicit private class GlobalConfigDetailsOps(cmd: GlobalConfigDetails) {
    def toBytes: Chunk[Byte] =
      Chunk.fromArray(cmd.asJson.toString().getBytes)
  }

  private def uploadGlobalConfigDetails(cmd: GlobalConfigDetails)(implicit ctx: Ctx): ZIO[Any, S3Exception, Unit] = {
    val jsonBytes = cmd.toBytes
    s3.putObject(bucketName, key, jsonBytes.length.toLong, ZStream.fromChunk(jsonBytes), UploadOptions.fromContentType("application/json"))
      .tapError(s => log.warn(s"Upload global config: [$cmd], failed with error: [${s.getMessage}]", s))
  }

  override def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, GlobalConfigDetails] = {
    val nextState = cmd.copy(version = cmd.version.inc)
    get()
      .flatMapError { s3Exception =>
        log
          .error(s"upsert global config fail cmd version:[${cmd.version}], error: [${s3Exception.getMessage}]", s3Exception)
          .as(EntryModifiedError("Global Config"))
      }
      .flatMap { state =>
        if (state.version == cmd.version) {
          uploadGlobalConfigDetails(nextState)
            .as(nextState)
            .flatMapError { s3Exception =>
              log
                .error(s"upsert global config fail server version:[${state.version}], cmd version:[${cmd.version}]", s3Exception)
                .as(EntryModifiedError("Global Config"))
            }
        } else {
          log.info(s"upsert global config fail server version:[${state.version}], cmd version:[${cmd.version}]") *>
            IO.fail(EntryModifiedError("Global Config"))
        }
      }
  }

  override def get()(implicit ctx: Ctx): Task[GlobalConfigDetails] =
    (s3.getObject(bucketName, key) >>> ZSink
      .collectAll[Byte]
      .map(c => c.map(_.toChar).mkString)
      .map(str =>
        parser
          .parse(str)
          .getOrElse(Json.Null)
          .as[GlobalConfigDetails]
          .toOption
          .getOrElse(defaultConfig)
      ))
      .catchSome {
        case s3e: S3Exception if s3e.statusCode() == 404 || s3e.getMessage.contains("The specified key does not exist.") =>
          ZIO.succeed(defaultConfig)
      }
      .tapError(s3e => log.error(s"Getting global config fail with error: ${s3e.getMessage}", s3e))
}

object GlobalConfigServiceS3Live {
  val layer: ZLayer[S3, Nothing, Has[GlobalConfigService]] = ZLayer.fromService[S3.Service, GlobalConfigService](s3 => GlobalConfigServiceS3Live(s3))

}
