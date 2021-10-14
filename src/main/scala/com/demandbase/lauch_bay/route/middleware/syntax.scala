package com.demandbase.lauch_bay.route.middleware

import sttp.tapir.endpoint.EndpointType
import sttp.tapir.extractFromRequest
import sttp.tapir.server.ziohttp.ZioHttpServerOptions
import sttp.tapir.typelevel.ParamConcat
import com.demandbase.lauch_bay.route.middleware.XRequestIdInterceptor.ctx
import com.demandbase.lauch_bay.trace.Ctx
import zio.UIO

object syntax {
  implicit final class ZioHttpServerOptionsSyntax[R](private val opts: ZioHttpServerOptions[R]) extends AnyVal {
    def prependXRequestIdInterceptor(nextRequestId: () => UIO[String]): ZioHttpServerOptions[R] = {
      opts.prependInterceptor(new XRequestIdInterceptor[R](nextRequestId))
    }
  }
  implicit final class EndpointTypeSyntax[I, E, O, -R](private val e: EndpointType[I, E, O, R]) extends AnyVal {
    def withRequestContext[IJ]()(implicit concat: ParamConcat.Aux[I, Ctx, IJ]): EndpointType[IJ, E, O, R] =
      e.in(extractFromRequest[Ctx](ctx))
  }
}
