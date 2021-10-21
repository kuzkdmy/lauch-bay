package com.demandbase.lauch_bay.service

import cats.implicits.{catsSyntaxOptionId, toShow}
import com.demandbase.lauch_bay.config.MainConfig
import com.demandbase.lauch_bay.domain.ProjectConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.filter.ListProjectsFilter
import com.demandbase.lauch_bay.domain.types.{IntVersion, ProjectId}
import com.demandbase.lauch_bay.trace.{Ctx, log}
import io.circe.syntax.EncoderOps
import io.circe.{Json, parser}
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.s3.model.S3Exception
import zio._
import zio.s3.{ObjectMetadata, S3, UploadOptions}
import zio.stream.{ZSink, ZStream}

trait ProjectsService {
  def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, ProjectConfigDetails]
  def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]]
  def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]]
  def delete(id: ProjectId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[ProjectConfigDetails]]
}
object ProjectsService extends Accessible[ProjectsService]

case class ProjectsServiceLive(s3: S3.Service, bucketName: String) extends ProjectsService {
  private def buildKey(id: ProjectId) = s"project/$id/config"

  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  implicit private class ProjectConfigDetailsOps(cmd: ProjectConfigDetails) {
    def toBytes: Chunk[Byte] =
      Chunk.fromArray(cmd.asJson.toString().getBytes)

    def toMetadata: Map[String, String] =
      Map("project_id" -> cmd.id.value, "version" -> cmd.version.value.toString)
  }

  private def uploadProjectConfigDetails(cmd: ProjectConfigDetails)(implicit ctx: Ctx): ZIO[Any, S3Exception, Unit] = {
    val jsonBytes = cmd.toBytes
    s3.putObject(bucketName, buildKey(cmd.id), jsonBytes.length.toLong, ZStream.fromChunk(jsonBytes), UploadOptions.from(cmd.toMetadata, "application/json"))
      .tapError(s => log.warn(s"When upload project config: [$cmd], received error: [${s.getMessage}]", s))
  }

  implicit private class ObjectMetadataOts(metadata: ObjectMetadata) {
    val projectId: Option[ProjectId] = metadata.metadata.get("project_id").map(ProjectId.apply)

  }

  override def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, ProjectConfigDetails] = {
    val nextState = cmd.copy(version = cmd.version.inc)
    get(cmd.id)
      .flatMap[Any, Throwable, UpsertRes] {
        case None =>
          uploadProjectConfigDetails(nextState)
            .as(UpsertRes.Upserted(None, nextState))
        case Some(prev) if prev.version == cmd.version =>
          uploadProjectConfigDetails(nextState)
            .as(UpsertRes.Upserted(prev.some, nextState))
        case Some(state) =>
          ZIO.succeed(UpsertRes.EntryModified(state.version))
      }
      .flatMapError(t =>
        log
          .error(s"upsert project config fail with error: [${t.getMessage}], cmd version:[${cmd.version}]", t)
          .as(EntryModifiedError("Project Config"))
      )
      .flatMap {
        case UpsertRes.EntryModified(stateV) =>
          log.info(s"upsert project config fail, server version:[$stateV], cmd version:[${cmd.version}]") *>
            IO.fail(EntryModifiedError("Project Config"))
        case UpsertRes.Upserted(prev, upserted) =>
          log.info(s"upsert project config, prev:[${prev.map(_.show).getOrElse("")}], current:[${upserted.show}]").as(upserted)
      }

  }
  override def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]] =
    (s3.getObject(bucketName, buildKey(id)) >>> ZSink
      .collectAll[Byte]
      .map(c => c.map(_.toChar).mkString)
      .map(str =>
        parser
          .parse(str)
          .getOrElse(Json.Null)
          .as[ProjectConfigDetails]
          .toOption
      ))
      .catchSome {
        case s3e: S3Exception if s3e.statusCode() == 404 || s3e.getMessage.contains("The specified key does not exist.") => ZIO.none
      }
      .tapError(s3e => log.error(s"Getting project config by key [${buildKey(id)}] fail with error: [${s3e.getMessage}]", s3e))

  override def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]] = {
    val idsF = filter.ids.map(_.toList.toSet)

    s3.listObjects(bucketName)
      .flatMap { objectList =>
        ZIO
          .collectAll(
            objectList.objectSummaries
              .filter(_.key.contains("project/"))
              .map(objSummary => s3.getObjectMetadata(objSummary.bucketName, objSummary.key))
          )
          .map(
            _.filter(metadata =>
              (for {
                projectId <- metadata.projectId
              } yield idsF.forall(_.contains(projectId)))
                .getOrElse(false)
            )
              .flatMap(_.projectId)
              .map(projectId => get(projectId))
          )
          .map(ZIO.collectAllPar(_))
          .flatMap(_.map(_.toList.flatten))
      }
  }
  override def delete(id: ProjectId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[ProjectConfigDetails]] =
    get(id)
      .flatMap {
        case Some(appConfig) if appConfig.version.value == version.value =>
          s3.deleteObject(bucketName, buildKey(id)).as(DeleteRes.Deleted(appConfig))
        case Some(appConfig) => ZIO.succeed(DeleteRes.EntryModified(appConfig.version))
        case None =>
          ZIO.succeed(DeleteRes.NotFound)
      }
      .flatMap {
        case DeleteRes.NotFound => IO.none
        case DeleteRes.EntryModified(stateV) =>
          log.info(s"delete project config fail, server version:[$version], cmd version:[${stateV}]") *>
            IO.fail(EntryModifiedError("Project Config"))
        case DeleteRes.Deleted(prev) =>
          log.info(s"deleted project: ${prev.show}") *> IO.some(prev)
      }
      .flatMapError(t =>
        log
          .error(s"delete project config fail, server version:[$version], error:[${t.getMessage}]", t)
          .as(EntryModifiedError("Project Config"))
      )

  sealed private trait UpsertRes
  private object UpsertRes {
    case class EntryModified(stateV: IntVersion) extends UpsertRes
    case class Upserted(prev: Option[ProjectConfigDetails], upserted: ProjectConfigDetails) extends UpsertRes
  }
  sealed private trait DeleteRes
  private object DeleteRes {
    case object NotFound extends DeleteRes
    case class EntryModified(stateV: IntVersion) extends DeleteRes
    case class Deleted(prev: ProjectConfigDetails) extends DeleteRes
  }
}

object ProjectsServiceLive {
  val layer: ZLayer[S3 with Has[MainConfig], Nothing, Has[ProjectsService]] = ZLayer.fromServices[S3.Service, MainConfig, ProjectsService] {
    case (s3, config) => ProjectsServiceLive(s3, config.storage.bucketName)
  }
}
