package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.MainApp.appLayer
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

object ProjectFunctionalTest extends BaseFunTest {

  override def spec = suite("Project")(
    testM("check create") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created1 <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
        } yield {
          assert(created1)(equalTo(project1.copy(version = project1.version.inc)))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check update") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created  <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          conflict <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).map(_.code.code)
          updateValidReqBody = project2.copy(id = project1.id, version = created.version)
          updated <- c.post(baseUri).body(updateValidReqBody.asJson.noSpaces).send(b).flatMap(toApiModel)
        } yield {
          assert(conflict)(equalTo(409)) &&
          assert(updated)(equalTo(updateValidReqBody.copy(version = updated.version)))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check load") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          notFound <- c.get(baseUri.addPath(project1.id.value)).send(b).map(_.code.code)
          created1 <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded1  <- c.get(baseUri.addPath(project1.id.toString)).send(b).flatMap(toApiModel)
        } yield {
          assert(notFound)(equalTo(404)) &&
          assert(created1)(equalTo(loaded1))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check delete") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created     <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          expect409_2 <- c.delete(baseUri.addPath(project1.id.toString)).body(ApiHasVersion(project1.version).asJson.noSpaces).send(b).map(_.code.code)
          deleted     <- c.delete(baseUri.addPath(project1.id.toString)).body(ApiHasVersion(created.version).asJson.noSpaces).send(b).map(_.code.code)
          notFound    <- c.get(baseUri.addPath(project1.id.toString)).send(b).map(_.code.code)
        } yield {
          assert(expect409_2)(equalTo(409)) &&
          assert(deleted)(equalTo(200)) &&
          assert(notFound)(equalTo(404))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check list") {
      (for {
        _ <- clearS3().toManaged_
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created1 <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          list1    <- c.get(baseUri).send(b).flatMap(toApiModelList)
          created2 <- c.post(baseUri).body(project2.asJson.noSpaces).send(b).flatMap(toApiModel)
          list2    <- c.get(baseUri).send(b).flatMap(toApiModelList)
          list3    <- c.get(baseUri.addParam("id", s"${project2.id}")).send(b).flatMap(toApiModelList)
        } yield {
          assert(created1)(equalTo(created1)) &&
          assert(created2)(equalTo(created2)) &&
          assert(list1)(equalTo(List(created1))) &&
          assert(list2)(equalTo(List(created1, created2))) &&
          assert(list3)(equalTo(List(created2)))
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
    deployConf = List(ApiReplicaCountConf(default = 1, envOverride = None)),
    version    = IntVersion(0)
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
    deployConf = List(ApiCpuRequestConf(default = 100, envOverride = None)),
    version    = IntVersion(0)
  )
  def toApiModel(resp: Response[String]): Task[ApiProject] =
    Task
      .fromEither(parse(resp.body).flatMap(_.as[ApiProject]))
      .tapError(err => ZIO(logger.error(resp.body + err.toString)))
  def toApiModelList(resp: Response[String]): Task[List[ApiProject]] =
    Task
      .fromEither(parse(resp.body).flatMap(_.as[List[ApiProject]]))
      .tapError(err => ZIO(logger.error(resp.body + err.toString)))

}
