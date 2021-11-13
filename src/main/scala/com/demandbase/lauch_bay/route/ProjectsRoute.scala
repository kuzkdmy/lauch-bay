package com.demandbase.lauch_bay.route

import cats.implicits.catsSyntaxEitherId
import com.demandbase.lauch_bay.domain.types.{ProjectId, QueryLimit}
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.ProjectsRoute.{CreateErr, DeleteErr, GetErr, UpdateErr}
import com.demandbase.lauch_bay.route.middleware.syntax._
import com.demandbase.lauch_bay.service.ProjectsService
import com.demandbase.lauch_bay.service.convert.ProjectsConverter._
import com.demandbase.lauch_bay.trace.Ctx
import derevo.circe.{decoder, encoder}
import derevo.derive
import sttp.model.StatusCode
import sttp.tapir
import sttp.tapir.codec.newtype._
import sttp.tapir.derevo.schema
import sttp.tapir.json.circe.jsonBody
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zhttp.http.{Endpoint => _, HttpApp}
import zio._

object ProjectsRoute {
  import sttp.tapir._
  type Env = Has[ProjectsRouteService]

  def endpoints[R <: Env](interpreter: ZioHttpInterpreter[R]): HttpApp[R, Throwable] =
    interpreter.toHttp(listE) { i => ProjectsRouteService(_.list(i)) } <>
      interpreter.toHttp(getE) { i => ProjectsRouteService(_.get(i)) } <>
      interpreter.toHttp(deleteE) { i => ProjectsRouteService(_.delete(i)) } <>
      interpreter.toHttp(createE) { i => ProjectsRouteService(_.create(i)) } <>
      interpreter.toHttp(updateE) { i => ProjectsRouteService(_.update(i)) }

  lazy val swaggerEndpoints = List(getE, deleteE, updateE, createE, listE)

  private val getE: Endpoint[(ProjectId, Ctx), GetErr, ApiProject, Any] = endpoint.get
    .in("api" / "v1.0" / "project" / path[ProjectId]("id"))
    .out(jsonBody[ApiProject])
    .withRequestContext()
    .errorOut(
      tapir.oneOf[GetErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[GetErr.NotFound].description("not found"))
      )
    )
  private val listE: Endpoint[(List[ProjectId], Option[QueryLimit], Ctx), Unit, List[ApiProject], Any] = endpoint.get
    .in("api" / "v1.0" / "project")
    .out(jsonBody[List[ApiProject]])
    .in(query[List[ProjectId]]("id"))
    .in(query[Option[QueryLimit]]("limit"))
    .withRequestContext()
  private val deleteE: Endpoint[(ProjectId, ApiHasVersion, Ctx), DeleteErr, Unit, Any] = endpoint.delete
    .in("api" / "v1.0" / "project" / path[ProjectId]("id"))
    .in(jsonBody[ApiHasVersion])
    .out(emptyOutput)
    .withRequestContext()
    .errorOut(
      tapir.oneOf[DeleteErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[DeleteErr.NotFound].description("not found")),
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[DeleteErr.Conflict].description("modified"))
      )
    )
  private val createE: Endpoint[(ApiProject, Ctx), CreateErr, ApiProject, Any] = endpoint.post
    .in("api" / "v1.0" / "project")
    .in(jsonBody[ApiProject])
    .out(jsonBody[ApiProject])
    .withRequestContext()
    .errorOut(
      tapir.oneOf[CreateErr](
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[CreateErr.Conflict].description("modified"))
      )
    )
  private val updateE: Endpoint[(ProjectId, ApiProject, Ctx), UpdateErr, ApiProject, Any] = endpoint.put
    .in("api" / "v1.0" / "project" / path[ProjectId]("id"))
    .in(jsonBody[ApiProject])
    .out(jsonBody[ApiProject])
    .withRequestContext()
    .errorOut(
      tapir.oneOf[UpdateErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[UpdateErr.NotFound].description("not found")),
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[UpdateErr.Conflict].description("modified"))
      )
    )

  @derive(schema, encoder, decoder) sealed trait DeleteErr
  object DeleteErr {
    @derive(schema, encoder, decoder) case class NotFound(message: String) extends DeleteErr
    @derive(schema, encoder, decoder) case class Conflict(message: String) extends DeleteErr
  }
  @derive(schema, encoder, decoder) sealed trait GetErr
  object GetErr {
    @derive(schema, encoder, decoder) case class NotFound(message: String) extends GetErr
  }
  @derive(schema, encoder, decoder) sealed trait CreateErr
  object CreateErr {
    @derive(schema, encoder, decoder) case class Conflict(message: String) extends CreateErr
  }
  @derive(schema, encoder, decoder) sealed trait UpdateErr
  object UpdateErr {
    @derive(schema, encoder, decoder) case class NotFound(message: String) extends UpdateErr
    @derive(schema, encoder, decoder) case class Conflict(message: String) extends UpdateErr
  }
}

trait ProjectsRouteService {
  def create(input: (ApiProject, Ctx)): Task[Either[CreateErr, ApiProject]]
  def update(input: (ProjectId, ApiProject, Ctx)): Task[Either[UpdateErr, ApiProject]]
  def get(input: (ProjectId, Ctx)): Task[Either[GetErr, ApiProject]]
  def list(input: (List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiProject]]]
  def delete(input: (ProjectId, ApiHasVersion, Ctx)): Task[Either[DeleteErr, Unit]]
}
object ProjectsRouteService extends Accessible[ProjectsRouteService]
class ProjectsRouteServiceLive(service: ProjectsService) extends ProjectsRouteService {

  override def create(input: (ApiProject, Ctx)): Task[Either[CreateErr, ApiProject]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertProject(apiCmd))
      notExists <- service.get(apiCmd.id)(ctx).map(_.isEmpty)
      res <- if (notExists) {
               service
                 .upsert(domainCmd)(ctx)
                 .foldM(
                   err => ZIO.left(CreateErr.Conflict(err.getMessage)),
                   res => ZIO.right(toApiProject(res))
                 )
             } else ZIO.succeed(CreateErr.Conflict(conflict(apiCmd.id)).asLeft[ApiProject])
    } yield res
  }

  override def update(input: (ProjectId, ApiProject, Ctx)): Task[Either[UpdateErr, ApiProject]] = {
    val (projectId, apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertProject(apiCmd.copy(id = projectId)))
      exists    <- service.get(projectId)(ctx).map(_.nonEmpty)
      res <- if (exists) {
               service
                 .upsert(domainCmd)(ctx)
                 .foldM(
                   err => ZIO.left(UpdateErr.Conflict(err.getMessage)),
                   res => ZIO.right(toApiProject(res))
                 )
             } else ZIO.succeed(UpdateErr.NotFound(notFound(projectId)).asLeft[ApiProject])
    } yield res
  }

  override def get(input: (ProjectId, Ctx)): Task[Either[GetErr.NotFound, ApiProject]] = {
    val (id, ctx) = input
    for {
      resOpt <- service.get(id)(ctx)
    } yield resOpt match {
      case Some(r) => Right(toApiProject(r))
      case None    => Left(GetErr.NotFound(notFound(id)))
    }
  }
  override def list(input: (List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiProject]]] = {
    val (ids, queryLimit, ctx) = input
    for {
      res <- service.list(toListProjectFilter(ids, queryLimit))(ctx)
    } yield Right(res.map(r => toApiProject(r)))
  }
  override def delete(input: (ProjectId, ApiHasVersion, Ctx)): Task[Either[DeleteErr, Unit]] = {
    val (id, hasV, ctx) = input
    for {
      res <- service
               .delete(id, hasV.version)(ctx)
               .foldM(
                 err => ZIO.succeed(DeleteErr.Conflict(err.getMessage).asLeft[Unit]),
                 {
                   case Some(_) => ZIO.succeed(().asRight[DeleteErr])
                   case None    => ZIO.left(DeleteErr.NotFound(notFound(id)))
                 }
               )
    } yield res
  }
  private def notFound(id: ProjectId) = s"project with GitLab id:$id not found"
  private def conflict(id: ProjectId) = s"project with GitLab id:$id already exists"
}
object ProjectsRouteServiceLive {
  val layer = ZLayer.fromService[ProjectsService, ProjectsRouteService](new ProjectsRouteServiceLive(_))
}
