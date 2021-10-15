package com.demandbase.lauch_bay.route

import com.demandbase.lauch_bay.domain.types.{ProjectId, QueryLimit}
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.middleware.syntax._
import com.demandbase.lauch_bay.service.ProjectsService
import com.demandbase.lauch_bay.service.convert.ProjectsConverter._
import com.demandbase.lauch_bay.trace.Ctx
import sttp.model.StatusCode
import sttp.tapir
import sttp.tapir._
import sttp.tapir.codec.newtype._
import sttp.tapir.json.circe.jsonBody
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zhttp.http.{HttpApp, Endpoint => _}
import zio._

object ProjectsRoute {
  type Env = Has[ProjectsRouteService]

  def endpoints[R <: Env](interpreter: ZioHttpInterpreter[R]): HttpApp[R, Throwable] =
    interpreter.toHttp(listE) { i => ProjectsRouteService(_.list(i)) } <>
      interpreter.toHttp(getE) { i => ProjectsRouteService(_.get(i)) } <>
      interpreter.toHttp(deleteE) { i => ProjectsRouteService(_.delete(i)) } <>
      interpreter.toHttp(upsertE) { i => ProjectsRouteService(_.upsert(i)) }

  lazy val swaggerEndpoints = List(getE, deleteE, upsertE, listE)

  private val getE: Endpoint[(ProjectId, Ctx), NotFound, ApiProject, Any] = endpoint.get
    .in("api" / "v1.0" / "project" / path[ProjectId]("id"))
    .out(jsonBody[ApiProject])
    .withRequestContext()
    .errorOut(
      tapir.oneOf(
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[NotFound].description("not found"))
      )
    )
  private val listE: Endpoint[(List[ProjectId], Option[QueryLimit], Ctx), Unit, List[ApiProject], Any] = endpoint.get
    .in("api" / "v1.0" / "project")
    .out(jsonBody[List[ApiProject]])
    .in(query[List[ProjectId]]("id"))
    .in(query[Option[QueryLimit]]("limit"))
    .withRequestContext()
  private val deleteE: Endpoint[(ProjectId, Ctx), NotFound, Unit, Any] = endpoint.delete
    .in("api" / "v1.0" / "project" / path[ProjectId]("id"))
    .out(emptyOutput)
    .withRequestContext()
    .errorOut(
      tapir.oneOf(
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[NotFound].description("not found"))
      )
    )
  private val upsertE: Endpoint[(ApiProject, Ctx), Unit, ApiProject, Any] = endpoint.post
    .in("api" / "v1.0" / "project")
    .in(jsonBody[ApiProject])
    .out(jsonBody[ApiProject])
    .withRequestContext()
}

trait ProjectsRouteService {
  def upsert(input: (ApiProject, Ctx)): Task[Either[Unit, ApiProject]]
  def get(input: (ProjectId, Ctx)): Task[Either[NotFound, ApiProject]]
  def list(input: (List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiProject]]]
  def delete(input: (ProjectId, Ctx)): Task[Either[NotFound, Unit]]
}
object ProjectsRouteService extends Accessible[ProjectsRouteService]
class ProjectsRouteServiceLive(service: ProjectsService) extends ProjectsRouteService {
  override def upsert(input: (ApiProject, Ctx)): Task[Either[Unit, ApiProject]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertProject(apiCmd))
      res       <- service.upsert(domainCmd)(ctx)
    } yield Right(toApiProject(res))
  }
  override def get(input: (ProjectId, Ctx)): Task[Either[NotFound, ApiProject]] = {
    val (id, ctx) = input
    for {
      resOpt <- service.get(id)(ctx)
    } yield resOpt match {
      case Some(r) => Right(toApiProject(r))
      case None    => Left(notFound(id))
    }
  }
  override def list(input: (List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiProject]]] = {
    val (ids, queryLimit, ctx) = input
    for {
      res <- service.list(toListProjectFilter(ids, queryLimit))(ctx)
    } yield Right(res.map(r => toApiProject(r)))
  }
  override def delete(input: (ProjectId, Ctx)): Task[Either[NotFound, Unit]] = {
    val (id, ctx) = input
    for {
      deleteOpt <- service.delete(id)(ctx)
    } yield deleteOpt match {
      case Some(_) => Right(())
      case None    => Left(notFound(id))
    }
  }
  private def notFound(id: ProjectId) = NotFound(s"project with GitLab id:$id not found")
}
object ProjectsRouteServiceLive {
  val layer = ZLayer.fromService[ProjectsService, ProjectsRouteService](new ProjectsRouteServiceLive(_))
}
