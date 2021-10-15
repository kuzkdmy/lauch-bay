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

object ApplicationFunctionalTest extends BaseFunTest {

  override def spec = suite("Application")(
    testM("check crud") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created1   <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded1    <- c.get(baseUri.addPath(application1.id.toString)).send(b).flatMap(toApiModel)
          list1      <- c.get(baseUri).send(b).flatMap(toApiModelList)
          created2   <- c.post(baseUri).body(application2.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded2    <- c.get(baseUri.addPath(application2.id.toString)).send(b).flatMap(toApiModel)
          list2      <- c.get(baseUri).send(b).flatMap(toApiModelList)
          removeCode <- c.delete(baseUri.addPath(application2.id.toString)).send(b).map(_.code.code)
          list3      <- c.get(baseUri).send(b).flatMap(toApiModelList)
        } yield {
          assert(created1)(equalTo(application1)) &&
          assert(created2)(equalTo(application2)) &&
          assert(created1)(equalTo(loaded1)) &&
          assert(created2)(equalTo(loaded2)) &&
          assert(list1)(equalTo(List(application1))) &&
          assert(list2)(equalTo(List(application1, application2))) &&
          assert(removeCode)(equalTo(200)) &&
          assert(list3)(equalTo(List(application1)))
        }
      }).use(identity).provideLayer(appLayer)
    }
  )

  val baseUri = uri"http://localhost:8193/api/v1.0/application"

  private val application1 = ApiApplication(
    id        = AppId("app-1"),
    projectId = ProjectId("project-1"),
    name      = AppName("app-name-1"),
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
  private val application2 = ApiApplication(
    id        = AppId("app-2"),
    projectId = ProjectId("project-1"),
    name      = AppName("app-name-2"),
    envConf = List(
      ApiEnvVarConf(
        envKey  = EnvVarKey("ENV_KEY_BOOLEAN_VALUE"),
        default = Some(ApiBooleanEnvVar(true)),
        envOverride = ApiEnvOverride(
          dev   = Some(ApiBooleanEnvVar(false)),
          stage = Some(ApiBooleanEnvVar(false)),
          prod  = Some(ApiBooleanEnvVar(true))
        )
      )
    ),
    deployConf = List(ApiCpuRequestConf(default = 100, envOverride = None)),
    version    = IntVersion(0)
  )
  def toApiModel(resp: Response[String]): Task[ApiApplication] =
    Task.fromEither(parse(resp.body).flatMap(_.as[ApiApplication]))
  def toApiModelList(resp: Response[String]): Task[List[ApiApplication]] =
    Task.fromEither(parse(resp.body).flatMap(_.as[List[ApiApplication]]))

}
