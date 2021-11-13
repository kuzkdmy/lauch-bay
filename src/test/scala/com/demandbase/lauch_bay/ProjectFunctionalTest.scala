package com.demandbase.lauch_bay

import cats.implicits.catsSyntaxOptionId
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
    testM("check create conflict") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          _        <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          conflict <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).map(_.code.code)
        } yield {
          assert(conflict)(equalTo(409))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check update") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created  <- c.post(baseUri).body(project1.asJson.noSpaces).send(b).flatMap(toApiModel)
          conflict <- c.put(baseUri.addPath(project1.id.value)).body(project1.asJson.noSpaces).send(b).map(_.code.code)
          updateValidReqBody = project2.copy(id = project1.id, version = created.version)
          updated <- c.put(baseUri.addPath(updateValidReqBody.id.value)).body(updateValidReqBody.asJson.noSpaces).send(b).flatMap(toApiModel)
        } yield {
          assert(conflict)(equalTo(409)) &&
          assert(updated)(equalTo(updateValidReqBody.copy(version = updated.version)))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check update not found") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          notFound <- c.put(baseUri.addPath(project1.id.value)).body(project1.asJson.noSpaces).send(b).map(_.code.code)
        } yield {
          assert(notFound)(equalTo(404))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check load") {
      (for {
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
    id   = ProjectId("anticor-liveramp"),
    name = ProjectName("Anticor Liveramp"),
    envConf = List(
      ApiEnvStringVarConf(
        envKey  = EnvVarKey("LIVERAMP_DB_HOST"),
        default = None,
        envOverride = ApiStringEnvVarOverride(
          dev   = ApiStringEnvVar("pg-liveramp.dev").some,
          stage = ApiStringEnvVar("pg-liveramp.stage").some,
          prod  = ApiStringEnvVar("pg-liveramp.prod").some
        )
      ),
      ApiEnvIntVarConf(
        envKey      = EnvVarKey("LIVERAMP_DB_PORT"),
        default     = ApiIntEnvVar(5432).some,
        envOverride = ApiIntEnvVarOverride(dev = None, stage = None, prod = None)
      ),
      ApiEnvStringVarConf(
        envKey      = EnvVarKey("LIVERAMP_DB_SCHEMA"),
        default     = ApiStringEnvVar("liveramp").some,
        envOverride = ApiStringEnvVarOverride(dev = None, stage = None, prod = None)
      ),
      ApiEnvStringVarConf(
        envKey      = EnvVarKey("LIVERAMP_DB_USER"),
        default     = ApiStringEnvVar("liveramp").some,
        envOverride = ApiStringEnvVarOverride(dev = None, stage = None, prod = None)
      )
    ),
    deployConf = List(
      ApiReplicaCountConf(default        = 1, envOverride                 = None),
      ApiCpuRequestConf(default          = 100, envOverride               = Some(ApiIntEnvOverride(dev = 50.some, stage = None, prod = 200.some))),
      ApiCpuLimitConf(default            = 1000, envOverride              = Some(ApiIntEnvOverride(dev = 100.some, stage = None, prod = 2000.some))),
      ApiRamMegabytesRequestConf(default = 512, envOverride               = Some(ApiIntEnvOverride(dev = 256.some, stage = None, prod = 1024.some))),
      ApiRamMegabytesLimitConf(default   = 1024, envOverride              = Some(ApiIntEnvOverride(dev = 512.some, stage = None, prod = 2048.some))),
      ApiJavaOptsConf(default            = "-Xms512M -Xmx1G", envOverride = Some(ApiStringEnvOverride(dev = "-Xms256M -Xmx512M".some, stage = None, prod = "-Xms1G -Xmx2G".some))),
      ApiEmptyDirMemoryConf(default      = false, envOverride             = Some(ApiBooleanEnvOverride(dev = None, stage = true.some, prod = true.some)))
    ),
    version = IntVersion(0)
  )
  private val project2 = ApiProject(
    id   = ProjectId("tenant-configuration"),
    name = ProjectName("Tenant Configuration"),
    envConf = List(
      ApiEnvStringVarConf(
        envKey  = EnvVarKey("TENANT_DB_HOST_PATTERN"),
        default = None,
        envOverride = ApiStringEnvVarOverride(
          dev   = ApiStringEnvVar("pg-{idx}-tenant.dev").some,
          stage = ApiStringEnvVar("pg-{idx}-tenant.stage").some,
          prod  = ApiStringEnvVar("pg-{idx}-tenant.prod").some
        )
      ),
      ApiEnvIntVarConf(
        envKey      = EnvVarKey("TENANT_DB_PORT"),
        default     = ApiIntEnvVar(5432).some,
        envOverride = ApiIntEnvVarOverride(dev = None, stage = None, prod = None)
      )
    ),
    deployConf = List(
      ApiReplicaCountConf(default = 1, envOverride   = Some(ApiIntEnvOverride(dev = 2.some, stage = 3.some, prod = 5.some))),
      ApiCpuRequestConf(default   = 200, envOverride = Some(ApiIntEnvOverride(dev = 100.some, stage = 100.some, prod = 500.some)))
    ),
    version = IntVersion(0)
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
