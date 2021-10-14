package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.config.MainConfig
import com.demandbase.lauch_bay.route._
import com.demandbase.lauch_bay.route.middleware.{ServerOptionsService, ServerOptionsServiceLive}
import com.demandbase.lauch_bay.service.ApplicationsServiceLive
import org.slf4j.LoggerFactory
import sttp.tapir.docs.openapi.OpenAPIDocsInterpreter
import sttp.tapir.openapi.circe.yaml._
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import sttp.tapir.swagger.ziohttp.SwaggerZioHttp
import zhttp.service.server.ServerChannelFactory
import zhttp.service.{EventLoopGroup, Server}
import zio.metrics.prometheus.Registry
import zio.{App, ExitCode, URIO, ZEnv, ZIO}

object MainApp extends App {
  implicit val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def run(args: List[String]): URIO[zio.ZEnv, ExitCode] =
    appProgramResource.useForever.provideLayer(appLayer).exitCode

  // format: off
  val appLayer =
    // common layers
    ZEnv.live >+> MainConfig.live >+> Registry.live >+>
    // service layers
    ApplicationsServiceLive.layer >+>
    // routes access service layers
    ApplicationsRouteServiceLive.layer >+>
    // zio-http layers
    ServerOptionsServiceLive.layer >+> EventLoopGroup.auto() >+> ServerChannelFactory.auto
  // format: on

  private type RouteEnv = ApplicationsRoute.Env
  val appProgramResource = for {
    port      <- ZIO.service[MainConfig].map(_.server.port).toManaged_
    serverOps <- ZIO.service[ServerOptionsService].flatMap(_.serverOptions[RouteEnv]).toManaged_
    res <- (Server.port(port) ++ Server.app {
             val interpreter      = ZioHttpInterpreter(serverOps)
             val swaggerEndpoints = ApplicationsRoute.swaggerEndpoints
             val openApiDocs      = OpenAPIDocsInterpreter().toOpenAPI(swaggerEndpoints, "Swagger docs", "1.0.0")
             ApplicationsRoute.endpoints(interpreter) <>
               new SwaggerZioHttp(openApiDocs.toYaml).route
           }).make
  } yield res
}
