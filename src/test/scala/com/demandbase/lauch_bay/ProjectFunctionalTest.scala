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

object ProjectFunctionalTest extends BaseFunTest {

  override def spec = suite("Project")(
    testM("check crud") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created1   <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded1    <- c.get(baseUri.addPath(project1.id.toString)).send(b).flatMap(toApiModel)
          list1      <- c.get(baseUri).send(b).flatMap(toApiModelList)
          created2   <- c.post(baseUri).body(project2.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded2    <- c.get(baseUri.addPath(project2.id.toString)).send(b).flatMap(toApiModel)
          list2      <- c.get(baseUri).send(b).flatMap(toApiModelList)
          removeCode <- c.delete(baseUri.addPath(project2.id.toString)).send(b).map(_.code.code)
          list3      <- c.get(baseUri).send(b).flatMap(toApiModelList)
        } yield {
          assert(created1)(equalTo(project1)) &&
          assert(created2)(equalTo(project2)) &&
          assert(created1)(equalTo(loaded1)) &&
          assert(created2)(equalTo(loaded2)) &&
          assert(list1)(equalTo(List(project1))) &&
          assert(list2)(equalTo(List(project1, project2))) &&
          assert(removeCode)(equalTo(200)) &&
          assert(list3)(equalTo(List(project1)))
        }
      }).use(identity).provideLayer(appLayer)
    }
  )

  val baseUri = uri"http://localhost:8193/api/v1.0/project"

  private val project1 = ApiProject(
    id   = ProjectId("project-1"),
    name = ProjectName("project-name-1"),
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
    deployConf = List(ApiReplicaCountConf(default = 1, envOverride = None))
  )
  private val project2 = ApiProject(
    id   = ProjectId("project-2"),
    name = ProjectName("project-name-2"),
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
    deployConf = List(ApiCpuRequestConf(default = 100, envOverride = None))
  )
  def toApiModel(resp: Response[String]): Task[ApiProject] =
    Task.fromEither(parse(resp.body).flatMap(_.as[ApiProject]))
  def toApiModelList(resp: Response[String]): Task[List[ApiProject]] =
    Task.fromEither(parse(resp.body).flatMap(_.as[List[ApiProject]]))

}
