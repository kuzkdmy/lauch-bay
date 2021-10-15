package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.MainApp.appLayer
import com.demandbase.lauch_bay.domain.types._
import com.demandbase.lauch_bay.dto._
import io.circe.parser._
import io.circe.syntax.EncoderOps
import sttp.client3.Response
import sttp.client3.asynchttpclient.zio.AsyncHttpClientZioBackend
import sttp.client3.quick._
import zio.Task
import zio.test.Assertion.equalTo
import zio.test.assert

object GlobalConfigFunctionalTest extends BaseFunTest {

  override def spec = suite("Global config")(
    testM("check crud") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          loaded1 <- c.get(baseUri).send(b).flatMap(toApiModel)
          updated <- c.put(baseUri).body(globalConf.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded2 <- c.get(baseUri).send(b).flatMap(toApiModel)
        } yield {
          assert(loaded1)(equalTo(ApiGlobalConfig(List.empty, List.empty, IntVersion(0)))) &&
          assert(updated)(equalTo(globalConf)) &&
          assert(loaded2)(equalTo(globalConf))
        }
      }).use(identity).provideLayer(appLayer)
    }
  )

  val baseUri = uri"http://localhost:8193/api/v1.0/global_config"

  private val globalConf = ApiGlobalConfig(
    envConf = List(
      ApiEnvVarConf(
        envKey  = EnvVarKey("ENV_KEY_1"),
        default = Some(ApiStringEnvVar("default-string")),
        envOverride = ApiEnvOverride(
          dev   = Some(ApiStringEnvVar("dev-override")),
          stage = Some(ApiStringEnvVar("stage-override")),
          prod  = Some(ApiStringEnvVar("prod-override"))
        )
      )
    ),
    deployConf = List(ApiReplicaCountConf(default = 1, envOverride = None)),
    version    = IntVersion(1)
  )

  def toApiModel(resp: Response[String]): Task[ApiGlobalConfig] =
    Task.fromEither(parse(resp.body).flatMap(_.as[ApiGlobalConfig]))

}
