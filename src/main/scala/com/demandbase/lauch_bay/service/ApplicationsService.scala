package com.demandbase.lauch_bay.service

import cats.implicits.toShow
import cats.syntax.option._
import com.demandbase.lauch_bay.config.MainConfig
import com.demandbase.lauch_bay.domain.AppConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.filter.ListApplicationsFilter
import com.demandbase.lauch_bay.domain.types.{IntVersion, ProjectId, SubProjectName}
import com.demandbase.lauch_bay.trace.{Ctx, log}
import io.circe.syntax.EncoderOps
import io.circe.{Json, parser}
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.s3.model.{ObjectCannedACL, S3Exception}
import zio._
import zio.s3.{ObjectMetadata, _}
import zio.stream.{ZSink, ZStream}

trait ApplicationsService {
  def upsert(cmd: AppConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, AppConfigDetails]
  def get(id: SubProjectName)(implicit ctx: Ctx): Task[Option[AppConfigDetails]]
  def list(filter: ListApplicationsFilter)(implicit ctx: Ctx): Task[List[AppConfigDetails]]
  def delete(id: SubProjectName, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[AppConfigDetails]]
}
object ApplicationsService extends Accessible[ApplicationsService]


case class ApplicationServiceLive(s3: S3.Service, bucketName: String) extends ApplicationsService {
  private def buildKey(id: SubProjectName) = s"project/application/$id/config"

  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  implicit private class AppConfigDetailsOps(cmd: AppConfigDetails) {
    def toBytes: Chunk[Byte] =
      Chunk.fromArray(cmd.asJson.toString().getBytes)

    def toMetadata: Map[String, String] =
      Map("appid" -> cmd.id.value, "projectid" -> cmd.projectId.value, "version" -> cmd.version.value.toString)
  }

  private def uploadAppConfigDetails(cmd: AppConfigDetails)(implicit ctx: Ctx): ZIO[Any, S3Exception, Unit] = {
    val jsonBytes = cmd.toBytes
    s3.putObject(
      bucketName,
      buildKey(cmd.id),
      jsonBytes.length.toLong,
      ZStream.fromChunk(jsonBytes),
      UploadOptions(cmd.toMetadata, ObjectCannedACL.BUCKET_OWNER_FULL_CONTROL, "application/json".some)
    ).tapError(s => log.warn(s"Upload application config [$cmd] failed with error: [${s.getMessage}]", s))
  }

  implicit private class ObjectMetadataOts(metadata: ObjectMetadata) {
    def projectId: Option[ProjectId] = metadata.metadata.get("projectid").map(ProjectId.apply)

    def subProjectName: Option[SubProjectName] = metadata.metadata.get("appid").map(SubProjectName.apply)

  }

  override def upsert(cmd: AppConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, AppConfigDetails] = {
    val nextState = cmd.copy(version = cmd.version.inc)
    get(cmd.id)
      .flatMap[Any, Throwable, UpsertRes] {
        case None =>
          uploadAppConfigDetails(nextState)
            .as(UpsertRes.Upserted(None, nextState))
        case Some(prev) if prev.version == cmd.version =>
          uploadAppConfigDetails(nextState)
            .as(UpsertRes.Upserted(prev.some, nextState))
        case Some(state) =>
          ZIO.succeed(UpsertRes.EntryModified(state.version))
      }
      .flatMapError(t =>
        log
          .error(s"upsert application config fail with error: [${t.getMessage}], cmd version:[${cmd.version}]", t)
          .as(EntryModifiedError("Application Config")))
      .flatMap {
        case UpsertRes.EntryModified(stateV) =>
          log.info(s"upsert application config fail, server version:[$stateV], cmd version:[${cmd.version}]") *>
            IO.fail(EntryModifiedError("Application Config"))
        case UpsertRes.Upserted(prev, upserted) =>
          log.info(s"upsert application config, prev:[${prev.map(_.show).getOrElse("")}], current:[${upserted.show}]").as(upserted)
      }
  }
  override def get(id: SubProjectName)(implicit ctx: Ctx): Task[Option[AppConfigDetails]] =
    (s3.getObject(bucketName, buildKey(id)) >>> ZSink
      .collectAll[Byte]
      .map(c => c.map(_.toChar).mkString)
      .map(str =>
        parser
          .parse(str)
          .getOrElse(Json.Null)
          .as[AppConfigDetails]
          .toOption
      ))
      .catchSome {
        case s3e: S3Exception if s3e.statusCode() == 404 || s3e.getMessage.contains("The specified key does not exist.") => ZIO.none
      }
      .tapError(s3e => log.error(s"Getting project config by key [${buildKey(id)}] fail with error: [${s3e.getMessage}]", s3e))

  override def list(filter: ListApplicationsFilter)(implicit ctx: Ctx): Task[List[AppConfigDetails]] = {
    val idsF      = filter.ids.map(_.toList.toSet)
    val projectsF = filter.projectIds.map(_.toList.toSet)

    s3.listObjects(bucketName)
      .flatMap { objectList =>
        ZIO
          .collectAll(
            objectList.objectSummaries
              .filter(_.key.contains("project/application/"))
              .map(objSummary => s3.getObjectMetadata(objSummary.bucketName, objSummary.key).debug(s"OS: $objSummary, MT:"))
          )
          .map(
            _.filter(metadata => {
              (for {
                subProjectName <- metadata.subProjectName
                projectId      <- metadata.projectId
              } yield idsF.forall(_.contains(subProjectName)) &&
                projectsF.forall(_.contains(projectId))).getOrElse(false)
            }).flatMap(_.subProjectName)
              .map(subProjectName => get(subProjectName))
          )
          .map(ZIO.collectAllPar(_))
          .flatMap(_.map(_.toList.flatten))
      }
  }
  override def delete(id: SubProjectName, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[AppConfigDetails]] =
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
          log.info(s"delete application config fail, server version:[$version], cmd version:[${stateV}]") *>
            IO.fail(EntryModifiedError("Application Config"))
        case DeleteRes.Deleted(prev) =>
          log.info(s"deleted application: ${prev.show}") *> IO.some(prev)
      }
      .flatMapError(t =>
        log
          .error(s"delete application config fail, server version:[$version], error:[${t.getMessage}]", t)
          .as(EntryModifiedError("Application Config"))
      )

  sealed private trait UpsertRes
  private object UpsertRes {
    case class EntryModified(stateV: IntVersion) extends UpsertRes
    case class Upserted(prev: Option[AppConfigDetails], upserted: AppConfigDetails) extends UpsertRes
  }
  sealed private trait DeleteRes
  private object DeleteRes {
    case object NotFound extends DeleteRes
    case class EntryModified(stateV: IntVersion) extends DeleteRes
    case class Deleted(prev: AppConfigDetails) extends DeleteRes
  }
}

object ApplicationServiceLive {
  val layer: ZLayer[S3 with Has[MainConfig], Nothing, Has[ApplicationsService]] = ZLayer.fromServices[S3.Service, MainConfig, ApplicationsService] {
    case (s3, config) => ApplicationServiceLive(s3, config.storage.bucketName)

  }
}
