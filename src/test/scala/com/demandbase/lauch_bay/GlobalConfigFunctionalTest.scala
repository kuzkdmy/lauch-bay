package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.domain.types._
import com.demandbase.lauch_bay.dto._
import io.circe.parser._
import io.circe.syntax.EncoderOps
import sttp.client3.Response
import sttp.client3.asynchttpclient.zio.AsyncHttpClientZioBackend
import sttp.client3.quick._
import zio.test.Assertion.equalTo
import zio.test.assert
import zio.{Task, ZIO}

object GlobalConfigFunctionalTest extends BaseFunTest {

  override def spec = suite("Global config")(
    testM("check crud") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          loaded1     <- c.get(baseUri).send(b).flatMap(toApiModel)
          updated1    <- c.put(baseUri).body(globalConf.asJson.noSpaces).send(b).flatMap(toApiModel)
          expect409_1 <- c.put(baseUri).body(globalConf.asJson.noSpaces).send(b).map(_.code.code)
          loaded2     <- c.get(baseUri).send(b).flatMap(toApiModel)
          updated2    <- c.put(baseUri).body(updated1.asJson.noSpaces).send(b).flatMap(toApiModel)
          expect409_2 <- c.put(baseUri).body(globalConf.asJson.noSpaces).send(b).map(_.code.code)
          loaded3     <- c.get(baseUri).send(b).flatMap(toApiModel)
        } yield {
          assert(loaded1)(equalTo(ApiGlobalConfig(List.empty, List.empty, IntVersion(0)))) &&
          assert(updated1)(equalTo(globalConf.copy(version = globalConf.version.inc))) &&
          assert(loaded2)(equalTo(globalConf.copy(version = globalConf.version.inc))) &&
          assert(updated2)(equalTo(globalConf.copy(version = globalConf.version.inc.inc))) &&
          assert(loaded3)(equalTo(globalConf.copy(version = globalConf.version.inc.inc))) &&
          assert(expect409_1)(equalTo(409)) &&
          assert(expect409_2)(equalTo(409)) &&
          assert(loaded2)(equalTo(globalConf.copy(version = globalConf.version.inc)))
        }
      }).use(identity).provideLayer(testLayer)
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
    version    = IntVersion(0)
  )

  def toApiModel(resp: Response[String]): Task[ApiGlobalConfig] =
    Task
      .fromEither(parse(resp.body).flatMap(_.as[ApiGlobalConfig]))
      .tapError(err => ZIO(logger.error(resp.body + err.toString)))

}
