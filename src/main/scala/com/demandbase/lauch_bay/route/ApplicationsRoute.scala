package com.demandbase.lauch_bay.route

import com.demandbase.lauch_bay.domain.types.{AppId, QueryLimit}
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.middleware.syntax._
import com.demandbase.lauch_bay.service.ApplicationsService
import com.demandbase.lauch_bay.service.convert.ApplicationsConverter._
import com.demandbase.lauch_bay.trace.Ctx
import sttp.model.StatusCode
import sttp.tapir
import sttp.tapir._
import sttp.tapir.codec.newtype._
import sttp.tapir.json.circe.jsonBody
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zhttp.http.{HttpApp, Endpoint => _}
import zio._

object ApplicationsRoute {
  type Env = Has[ApplicationsRouteService]

  def endpoints[R <: Env](interpreter: ZioHttpInterpreter[R]): HttpApp[R, Throwable] =
    interpreter.toHttp(listE) { i => ApplicationsRouteService(_.list(i)) } <>
      interpreter.toHttp(getE) { i => ApplicationsRouteService(_.get(i)) } <>
      interpreter.toHttp(deleteE) { i => ApplicationsRouteService(_.delete(i)) } <>
      interpreter.toHttp(upsertE) { i => ApplicationsRouteService(_.upsert(i)) }

  lazy val swaggerEndpoints = List(getE, deleteE, upsertE, listE)

  private val getE: Endpoint[(AppId, Ctx), NotFound, ApiApplication, Any] = endpoint.get
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
    .out(jsonBody[ApiApplication])
    .withRequestContext()
    .errorOut(
      tapir.oneOf(
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[NotFound].description("not found"))
      )
    )
  private val listE: Endpoint[(List[AppId], Option[QueryLimit], Ctx), Unit, List[ApiApplication], Any] = endpoint.get
    .in("api" / "v1.0" / "application")
    .out(jsonBody[List[ApiApplication]])
    .in(query[List[AppId]]("id"))
    .in(query[Option[QueryLimit]]("limit"))
    .withRequestContext()
  private val deleteE: Endpoint[(AppId, Ctx), NotFound, Unit, Any] = endpoint.delete
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
    .out(emptyOutput)
    .withRequestContext()
    .errorOut(
      tapir.oneOf(
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[NotFound].description("not found"))
      )
    )
  private val upsertE: Endpoint[(ApiApplication, Ctx), Unit, ApiApplication, Any] = endpoint.post
    .in("api" / "v1.0" / "application")
    .in(jsonBody[ApiApplication])
    .out(jsonBody[ApiApplication])
    .withRequestContext()
}

trait ApplicationsRouteService {
  def upsert(input: (ApiApplication, Ctx)): Task[Either[Unit, ApiApplication]]
  def get(input: (AppId, Ctx)): Task[Either[NotFound, ApiApplication]]
  def list(input: (List[AppId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiApplication]]]
  def delete(input: (AppId, Ctx)): Task[Either[NotFound, Unit]]
}
object ApplicationsRouteService extends Accessible[ApplicationsRouteService]
class ApplicationsRouteServiceLive(service: ApplicationsService) extends ApplicationsRouteService {
  override def upsert(input: (ApiApplication, Ctx)): Task[Either[Unit, ApiApplication]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertApplication(apiCmd))
      res       <- service.upsert(domainCmd)(ctx)
    } yield Right(toApiApplication(res))
  }
  override def get(input: (AppId, Ctx)): Task[Either[NotFound, ApiApplication]] = {
    val (id, ctx) = input
    for {
      resOpt <- service.get(id)(ctx)
    } yield resOpt match {
      case Some(r) => Right(toApiApplication(r))
      case None    => Left(notFound(id))
    }
  }
  override def list(input: (List[AppId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiApplication]]] = {
    val (ids, queryLimit, ctx) = input
    for {
      res <- service.list(toListApplicationFilter(ids, queryLimit))(ctx)
    } yield Right(res.map(r => toApiApplication(r)))
  }
  override def delete(input: (AppId, Ctx)): Task[Either[NotFound, Unit]] = {
    val (id, ctx) = input
    for {
      deleteOpt <- service.delete(id)(ctx)
    } yield deleteOpt match {
      case Some(_) => Right(())
      case None    => Left(notFound(id))
    }
  }
  private def notFound(id: AppId) = NotFound(s"application with GitLab id:$id not found")
}
object ApplicationsRouteServiceLive {
  val layer = ZLayer.fromService[ApplicationsService, ApplicationsRouteService](new ApplicationsRouteServiceLive(_))
}
