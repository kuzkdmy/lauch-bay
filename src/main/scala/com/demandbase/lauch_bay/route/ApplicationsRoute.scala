package com.demandbase.lauch_bay.route

import com.demandbase.lauch_bay.domain.types.{AppId, ProjectId, QueryLimit}
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.ApplicationsRoute.{DeleteErr, GetErr, UpdateErr}
import com.demandbase.lauch_bay.route.middleware.syntax._
import com.demandbase.lauch_bay.service.ApplicationsService
import com.demandbase.lauch_bay.service.convert.ApplicationsConverter._
import com.demandbase.lauch_bay.trace.Ctx
import derevo.circe.{decoder, encoder}
import derevo.derive
import sttp.model.StatusCode
import sttp.tapir
import sttp.tapir.codec.newtype._
import sttp.tapir.derevo.schema
import sttp.tapir.json.circe.jsonBody
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zhttp.http.{HttpApp, Endpoint => _}
import zio._

object ApplicationsRoute {
  type Env = Has[ApplicationsRouteService]
  import sttp.tapir._

  def endpoints[R <: Env](interpreter: ZioHttpInterpreter[R]): HttpApp[R, Throwable] =
    interpreter.toHttp(listE) { i => ApplicationsRouteService(_.list(i)) } <>
      interpreter.toHttp(getE) { i => ApplicationsRouteService(_.get(i)) } <>
      interpreter.toHttp(deleteE) { i => ApplicationsRouteService(_.delete(i)) } <>
      interpreter.toHttp(upsertE) { i => ApplicationsRouteService(_.upsert(i)) }

  lazy val swaggerEndpoints = List(getE, deleteE, upsertE, listE)

  private val getE: Endpoint[(AppId, Ctx), GetErr, ApiApplication, Any] = endpoint.get
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
    .out(jsonBody[ApiApplication])
    .withRequestContext()
    .errorOut(
      tapir.oneOf[GetErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[GetErr.NotFound].description("not found"))
      )
    )
  private val listE: Endpoint[(List[AppId], List[ProjectId], Option[QueryLimit], Ctx), Unit, List[ApiApplication], Any] = endpoint.get
    .in("api" / "v1.0" / "application")
    .out(jsonBody[List[ApiApplication]])
    .in(query[List[AppId]]("id"))
    .in(query[List[ProjectId]]("project_id"))
    .in(query[Option[QueryLimit]]("limit"))
    .withRequestContext()
  private val deleteE: Endpoint[(AppId, Ctx), DeleteErr, Unit, Any] = endpoint.delete
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
    .out(emptyOutput)
    .withRequestContext()
    .errorOut(
      tapir.oneOf[DeleteErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[DeleteErr.NotFound].description("not found")),
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[DeleteErr.Conflict].description("modified"))
      )
    )
  private val upsertE: Endpoint[(ApiApplication, Ctx), UpdateErr, ApiApplication, Any] = endpoint.post
    .in("api" / "v1.0" / "application")
    .in(jsonBody[ApiApplication])
    .out(jsonBody[ApiApplication])
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
  @derive(schema, encoder, decoder) sealed trait UpdateErr
  object UpdateErr {
    @derive(schema, encoder, decoder) case class NotFound(message: String) extends UpdateErr
    @derive(schema, encoder, decoder) case class Conflict(message: String) extends UpdateErr
  }
}

trait ApplicationsRouteService {
  def upsert(input: (ApiApplication, Ctx)): Task[Either[UpdateErr, ApiApplication]]
  def get(input: (AppId, Ctx)): Task[Either[GetErr, ApiApplication]]
  def list(input: (List[AppId], List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiApplication]]]
  def delete(input: (AppId, Ctx)): Task[Either[DeleteErr, Unit]]
}
object ApplicationsRouteService extends Accessible[ApplicationsRouteService]
class ApplicationsRouteServiceLive(service: ApplicationsService) extends ApplicationsRouteService {
  override def upsert(input: (ApiApplication, Ctx)): Task[Either[UpdateErr, ApiApplication]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertApplication(apiCmd))
      res       <- service.upsert(domainCmd)(ctx)
    } yield Right(toApiApplication(res))
  }
  override def get(input: (AppId, Ctx)): Task[Either[GetErr, ApiApplication]] = {
    val (id, ctx) = input
    for {
      resOpt <- service.get(id)(ctx)
    } yield resOpt match {
      case Some(r) => Right(toApiApplication(r))
      case None    => Left(GetErr.NotFound(notFound(id)))
    }
  }
  override def list(input: (List[AppId], List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiApplication]]] = {
    val (ids, projectIds, queryLimit, ctx) = input
    for {
      res <- service.list(toListApplicationFilter(ids, projectIds, queryLimit))(ctx)
    } yield Right(res.map(r => toApiApplication(r)))
  }
  override def delete(input: (AppId, Ctx)): Task[Either[DeleteErr, Unit]] = {
    val (id, ctx) = input
    for {
      deleteOpt <- service.delete(id)(ctx)
    } yield deleteOpt match {
      case Some(_) => Right(())
      case None    => Left(DeleteErr.NotFound(notFound(id)))
    }
  }
  private def notFound(id: AppId) = s"application with GitLab id:$id not found"
}
object ApplicationsRouteServiceLive {
  val layer = ZLayer.fromService[ApplicationsService, ApplicationsRouteService](new ApplicationsRouteServiceLive(_))
}
