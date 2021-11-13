package com.demandbase.lauch_bay.route

import cats.implicits.catsSyntaxEitherId
import com.demandbase.lauch_bay.domain.types.{AppId, ProjectId, QueryLimit}
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.ApplicationsRoute.{CreateErr, DeleteErr, GetErr, UpdateErr}
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
      interpreter.toHttp(createE) { i => ApplicationsRouteService(_.create(i)) } <>
      interpreter.toHttp(updateE) { i => ApplicationsRouteService(_.update(i)) }

  lazy val swaggerEndpoints = List(getE, deleteE, createE, updateE, listE)

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
  private val deleteE: Endpoint[(AppId, ApiHasVersion, Ctx), DeleteErr, Unit, Any] = endpoint.delete
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
    .in(jsonBody[ApiHasVersion])
    .out(emptyOutput)
    .withRequestContext()
    .errorOut(
      tapir.oneOf[DeleteErr](
        oneOfMappingFromMatchType(StatusCode.NotFound, jsonBody[DeleteErr.NotFound].description("not found")),
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[DeleteErr.Conflict].description("modified"))
      )
    )
  private val createE: Endpoint[(ApiApplication, Ctx), CreateErr, ApiApplication, Any] = endpoint.post
    .in("api" / "v1.0" / "application")
    .in(jsonBody[ApiApplication])
    .out(jsonBody[ApiApplication])
    .withRequestContext()
    .errorOut(
      tapir.oneOf[CreateErr](
        oneOfMappingFromMatchType(StatusCode.Conflict, jsonBody[CreateErr.Conflict].description("modified"))
      )
    )
  private val updateE: Endpoint[(AppId, ApiApplication, Ctx), UpdateErr, ApiApplication, Any] = endpoint.put
    .in("api" / "v1.0" / "application" / path[AppId]("id"))
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

trait ApplicationsRouteService {
  def create(input: (ApiApplication, Ctx)): Task[Either[CreateErr, ApiApplication]]
  def update(input: (AppId, ApiApplication, Ctx)): Task[Either[UpdateErr, ApiApplication]]
  def get(input: (AppId, Ctx)): Task[Either[GetErr, ApiApplication]]
  def list(input: (List[AppId], List[ProjectId], Option[QueryLimit], Ctx)): Task[Either[Unit, List[ApiApplication]]]
  def delete(input: (AppId, ApiHasVersion, Ctx)): Task[Either[DeleteErr, Unit]]
}
object ApplicationsRouteService extends Accessible[ApplicationsRouteService]
class ApplicationsRouteServiceLive(service: ApplicationsService) extends ApplicationsRouteService {

  override def create(input: (ApiApplication, Ctx)): Task[Either[CreateErr, ApiApplication]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertApplication(apiCmd))
      notExists <- service.get(apiCmd.id)(ctx).map(_.isEmpty)
      res <- if (notExists) {
               service
                 .upsert(domainCmd)(ctx)
                 .foldM(
                   err => ZIO.left(CreateErr.Conflict(err.getMessage)),
                   res => ZIO.right(toApiApplication(res))
                 )
             } else ZIO.succeed(CreateErr.Conflict(conflict(apiCmd.id)).asLeft[ApiApplication])
    } yield res
  }

  override def update(input: (AppId, ApiApplication, Ctx)): Task[Either[UpdateErr, ApiApplication]] = {
    val (appId, apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertApplication(apiCmd.copy(id = appId)))
      exists    <- service.get(appId)(ctx).map(_.nonEmpty)
      res <- if (exists) {
               service
                 .upsert(domainCmd)(ctx)
                 .foldM(
                   err => ZIO.left(UpdateErr.Conflict(err.getMessage)),
                   res => ZIO.right(toApiApplication(res))
                 )
             } else ZIO.succeed(UpdateErr.NotFound(notFound(appId)).asLeft[ApiApplication])
    } yield res
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
  override def delete(input: (AppId, ApiHasVersion, Ctx)): Task[Either[DeleteErr, Unit]] = {
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
  private def notFound(id: AppId) = s"application with id:$id not found"
  private def conflict(id: AppId) = s"application with id:$id already exists"

}
object ApplicationsRouteServiceLive {
  val layer = ZLayer.fromService[ApplicationsService, ApplicationsRouteService](new ApplicationsRouteServiceLive(_))
}
