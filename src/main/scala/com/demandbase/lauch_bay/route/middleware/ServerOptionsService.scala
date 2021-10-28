package com.demandbase.lauch_bay.route.middleware

import cats.implicits.catsSyntaxOptionId
import com.demandbase.lauch_bay.route.middleware.syntax.ZioHttpServerOptionsSyntax
import com.demandbase.lauch_bay.trace.{Ctx, log}
import org.slf4j.LoggerFactory
import sttp.tapir.metrics.prometheus.PrometheusMetrics
import sttp.tapir.server.interceptor.CustomInterceptors
import sttp.tapir.server.interceptor.log.{DefaultServerLog, ServerLogInterceptor}
import sttp.tapir.server.ziohttp.ZioHttpServerOptions
import sttp.tapir.server.ziohttp.ZioHttpServerOptions.{defaultCreateFile, defaultDeleteFile}
import zio.metrics.prometheus.Registry
import zio.{RIO, UIO, URIO, ZLayer}

import java.util.UUID

trait ServerOptionsService {
  def serverOptions[R]: UIO[ZioHttpServerOptions[R]]
}

class ServerOptionsServiceLive(registry: Registry.Service) extends ServerOptionsService {
  def serverOptions[R]: UIO[ZioHttpServerOptions[R]] = {
    registry
      .getCurrent()
      .map(collectorRegistry => {
        CustomInterceptors[RIO[R, *], LogCmd, ZioHttpServerOptions[R]](
          createLogInterceptor = sl =>
            new ServerLogInterceptor[LogCmd, RIO[R, *]](
              log = sl,
              toEffect = (cmd, serverReq) => {
                implicit val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)
                implicit val c: Ctx                   = XRequestIdInterceptor.ctx(serverReq)
                cmd match {
                  case Info(msg, err)  => err.fold(log.info(msg))(log.info(msg, _))
                  case Error(msg, err) => err.fold(log.error(msg))(log.error(msg, _))
                  case NoLog()         => UIO.unit
                }
              }
            ),
          createOptions      = ci => ZioHttpServerOptions[R](defaultCreateFile, defaultDeleteFile, ci.interceptors),
          metricsInterceptor = Some(PrometheusMetrics[RIO[R, *]]("tapir", collectorRegistry).metricsInterceptor()),
          exceptionHandler   = Some(AppExceptionHandler.handler),
          serverLog = Some(
            DefaultServerLog(
              doLogWhenHandled       = (m, errOpt) => Info(m, errOpt),
              doLogAllDecodeFailures = (m, errOpt) => Error(m, errOpt),
              doLogExceptions        = (m, err) => Error(m, err.some),
              noLog                  = NoLog(),
              logWhenHandled         = true,
              logAllDecodeFailures   = false,
              logLogicExceptions     = true
            )
          )
        ).options.prependXRequestIdInterceptor(() => URIO(UUID.randomUUID().toString))
      })
  }
  sealed private trait LogCmd
  private case class Info(msg: String, err: Option[Throwable]) extends LogCmd
  private case class Error(msg: String, err: Option[Throwable]) extends LogCmd
  private case class NoLog() extends LogCmd
}

object ServerOptionsServiceLive {
  val layer = ZLayer.fromService[
    Registry.Service,
    ServerOptionsService
  ](new ServerOptionsServiceLive(_))
}
