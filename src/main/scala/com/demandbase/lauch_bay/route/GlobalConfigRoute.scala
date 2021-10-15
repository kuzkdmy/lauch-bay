package com.demandbase.lauch_bay.route

import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.route.middleware.syntax._
import com.demandbase.lauch_bay.service.GlobalConfigService
import com.demandbase.lauch_bay.service.convert.GlobalConverter.{toApiGlobalConfig, toUpsertGlobalConfig}
import com.demandbase.lauch_bay.trace.Ctx
import sttp.tapir._
import sttp.tapir.json.circe.jsonBody
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zhttp.http.{HttpApp, Endpoint => _}
import zio._

object GlobalConfigRoute {
  type Env = Has[GlobalConfigRouteService]

  def endpoints[R <: Env](interpreter: ZioHttpInterpreter[R]): HttpApp[R, Throwable] =
    interpreter.toHttp(getE) { i => GlobalConfigRouteService(_.get(i)) } <>
      interpreter.toHttp(upsertE) { i => GlobalConfigRouteService(_.upsert(i)) }

  lazy val swaggerEndpoints = List(getE, upsertE)

  private val getE: Endpoint[Ctx, Unit, ApiGlobalConfig, Any] = endpoint.get
    .in("api" / "v1.0" / "global_config")
    .out(jsonBody[ApiGlobalConfig])
    .withRequestContext()
  private val upsertE: Endpoint[(ApiGlobalConfig, Ctx), Unit, ApiGlobalConfig, Any] = endpoint.put
    .in("api" / "v1.0" / "global_config")
    .in(jsonBody[ApiGlobalConfig])
    .out(jsonBody[ApiGlobalConfig])
    .withRequestContext()
}

trait GlobalConfigRouteService {
  def upsert(input: (ApiGlobalConfig, Ctx)): Task[Either[Unit, ApiGlobalConfig]]
  def get(input: Ctx): Task[Either[Unit, ApiGlobalConfig]]
}
object GlobalConfigRouteService extends Accessible[GlobalConfigRouteService]
class GlobalConfigRouteServiceLive(service: GlobalConfigService) extends GlobalConfigRouteService {
  override def upsert(input: (ApiGlobalConfig, Ctx)): Task[Either[Unit, ApiGlobalConfig]] = {
    val (apiCmd, ctx) = input
    for {
      domainCmd <- ZIO.succeed(toUpsertGlobalConfig(apiCmd))
      res       <- service.upsert(domainCmd)(ctx)
    } yield Right(toApiGlobalConfig(res))
  }
  override def get(input: Ctx): Task[Either[Unit, ApiGlobalConfig]] = {
    val ctx = input
    for {
      res <- service.get()(ctx)
    } yield Right(toApiGlobalConfig(res))
  }
}
object GlobalConfigRouteServiceLive {
  val layer = ZLayer.fromService[GlobalConfigService, GlobalConfigRouteService](new GlobalConfigRouteServiceLive(_))
}
