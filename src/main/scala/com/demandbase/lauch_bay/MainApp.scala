package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.config.MainConfig
import com.demandbase.lauch_bay.route._
import com.demandbase.lauch_bay.route.middleware.{ServerOptionsService, ServerOptionsServiceLive}
import com.demandbase.lauch_bay.service.{ApplicationServiceLive, GlobalConfigServiceLive, ProjectsServiceLive}
import org.slf4j.LoggerFactory
import sttp.tapir.docs.openapi.OpenAPIDocsInterpreter
import sttp.tapir.openapi.circe.yaml._
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import sttp.tapir.swagger.ziohttp.SwaggerZioHttp
import zhttp.service.server.ServerChannelFactory
import zhttp.service.{EventLoopGroup, Server}
import zio.metrics.prometheus.Registry
import zio.s3.providers.const
import zio.s3.{Live, S3, S3Region}
import zio.{App, ExitCode, Has, URIO, ZEnv, ZIO, ZLayer}

import java.net.URI

object MainApp extends App {
  implicit val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def run(args: List[String]): URIO[zio.ZEnv, ExitCode] =
    appProgramResource.useForever.provideLayer(appLayer).exitCode

  val s3Layer: ZLayer[Has[MainConfig], Nothing, S3] =
    ZLayer.fromFunctionManaged(config =>
      Live.connect(
        S3Region.unsafeFromString(config.get.storage.region),
        const(config.get.storage.accessKeyId, config.get.storage.secretAccessKey),
        Some(new URI(config.get.storage.host))
      ).orDie)

  // format: off
  val appLayer =
    // common layers
    ZEnv.live >+> MainConfig.live >+> Registry.live >+>
    // service layers
    s3Layer >+> GlobalConfigServiceLive.layer >+> ProjectsServiceLive.layer >+> ApplicationServiceLive.layer >+>
    // routes access service layers
    GlobalConfigRouteServiceLive.layer >+> ProjectsRouteServiceLive.layer >+> ApplicationsRouteServiceLive.layer >+>
    // zio-http layers
    ServerOptionsServiceLive.layer >+> EventLoopGroup.auto() >+> ServerChannelFactory.auto
  // format: on

  private type RouteEnv = GlobalConfigRoute.Env with ProjectsRoute.Env with ApplicationsRoute.Env
  val appProgramResource = for {
    port      <- ZIO.service[MainConfig].map(_.server.port).toManaged_
    serverOps <- ZIO.service[ServerOptionsService].flatMap(_.serverOptions[RouteEnv]).toManaged_
    res <- (Server.port(port) ++ Server.app {
             val interpreter      = ZioHttpInterpreter(serverOps)
             val swaggerEndpoints = GlobalConfigRoute.swaggerEndpoints ++ ProjectsRoute.swaggerEndpoints ++ ApplicationsRoute.swaggerEndpoints
             val openApiDocs      = OpenAPIDocsInterpreter().toOpenAPI(swaggerEndpoints, "Swagger docs", "1.0.0")
             GlobalConfigRoute.endpoints(interpreter) <>
               ProjectsRoute.endpoints(interpreter) <>
               ApplicationsRoute.endpoints(interpreter) <>
               new SwaggerZioHttp(openApiDocs.toYaml).route
           }).make
  } yield res
}
