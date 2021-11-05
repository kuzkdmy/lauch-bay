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

object ApplicationFunctionalTest extends BaseFunTest {

  override def spec = suite("Application")(
    testM("check create") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created1 <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
        } yield {
          assert(created1)(equalTo(application1.copy(version = application1.version.inc)))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check update") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          created  <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
          conflict <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).map(_.code.code)
          updateValidReqBody = application2.copy(id = application1.id, version = created.version)
          updated <- c.post(baseUri).body(updateValidReqBody.asJson.noSpaces).send(b).flatMap(toApiModel)
        } yield {
          assert(conflict)(equalTo(409)) &&
          assert(updated)(equalTo(updateValidReqBody.copy(version = updated.version)))
        }
      }).use(identity).provideLayer(appLayer)
    },
    testM("check load") {
      (for {
        _ <- MainApp.appProgramResource
        b <- AsyncHttpClientZioBackend().toManaged_
      } yield {
        for {
          notFound <- c.get(baseUri.addPath(application1.id.value)).send(b).map(_.code.code)
          created1 <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
          loaded1  <- c.get(baseUri.addPath(application1.id.toString)).send(b).flatMap(toApiModel)
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
          created     <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
          expect409_2 <- c.delete(baseUri.addPath(application1.id.toString)).body(ApiHasVersion(application1.version).asJson.noSpaces).send(b).map(_.code.code)
          deleted     <- c.delete(baseUri.addPath(application1.id.toString)).body(ApiHasVersion(created.version).asJson.noSpaces).send(b).map(_.code.code)
          notFound    <- c.get(baseUri.addPath(application1.id.toString)).send(b).map(_.code.code)
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
          created1 <- c.post(baseUri).body(application1.asJson.noSpaces).send(b).flatMap(toApiModel)
          list1    <- c.get(baseUri).send(b).flatMap(toApiModelList)
          created2 <- c.post(baseUri).body(application2.asJson.noSpaces).send(b).flatMap(toApiModel)
          list2    <- c.get(baseUri).send(b).flatMap(toApiModelList)
          list3    <- c.get(baseUri.addParam("id", s"${application2.id}")).send(b).flatMap(toApiModelList)
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

  val baseUri = uri"http://localhost:8193/api/v1.0/application"

  private val application1 = ApiApplication(
    id        = AppId("anticor-liveramp-audience-file-upload"),
    projectId = ProjectId("anticor-liveramp"),
    name      = AppName("Anticor LiveRamp Audience File Upload"),
    envConf = List(
      ApiEnvBooleanVarConf(
        envKey  = EnvVarKey("ENV_KEY_BOOLEAN_VALUE"),
        default = Some(ApiBooleanEnvVar(true)),
        envOverride = ApiBooleanEnvVarOverride(
          dev   = Some(ApiBooleanEnvVar(false)),
          stage = Some(ApiBooleanEnvVar(false)),
          prod  = Some(ApiBooleanEnvVar(true))
        )
      ),
      ApiEnvIntVarConf(
        envKey      = EnvVarKey("ANTICOR_LIVERAMP_AUDIENCE_FILE_UPLOAD_TENANT_PARALLELISM"),
        default     = ApiIntEnvVar(2).some,
        envOverride = ApiIntEnvVarOverride(dev = ApiIntEnvVar(1).some, stage = None, prod = ApiIntEnvVar(5).some)
      ),
      ApiEnvIntVarConf(
        envKey      = EnvVarKey("ANTICOR_LIVERAMP_AUDIENCE_FILE_UPLOAD_INTERVAL_NOT_OFTEN_THAN_MINUTES"),
        default     = ApiIntEnvVar(24 * 60).some,
        envOverride = ApiIntEnvVarOverride(dev = ApiIntEnvVar(15).some, stage = ApiIntEnvVar(3 * 60).some, prod = None)
      )
    ),
    deployConf = List(
      ApiCpuRequestConf(default   = 200, envOverride  = ApiIntEnvOverride(dev = None, stage = None, prod = 500.some).some),
      ApiRamMegabytesConf(default = 1024, envOverride = ApiIntEnvOverride(dev = None, stage = 2048.some, prod = 8096.some).some)
    ),
    version = IntVersion(0)
  )
  private val application2 = ApiApplication(
    id        = AppId("tenant-configuration-streaming"),
    projectId = ProjectId("tenant-configuration"),
    name      = AppName("Tenant Configuration Streaming"),
    envConf = List(
      ApiEnvIntVarConf(
        envKey  = EnvVarKey("TENANT_CONFIGURATION_STREAMING_PARALLELISM"),
        default = ApiIntEnvVar(10).some,
        envOverride = ApiIntEnvVarOverride(
          dev   = ApiIntEnvVar(2).some,
          stage = None,
          prod  = ApiIntEnvVar(20).some
        )
      ),
      ApiEnvIntVarConf(
        envKey  = EnvVarKey("TENANT_CONFIGURATION_STREAMING_BLACKLIST_TTL_SECONDS"),
        default = None,
        envOverride = ApiIntEnvVarOverride(
          dev   = ApiIntEnvVar(10).some,
          stage = ApiIntEnvVar(60).some,
          prod  = ApiIntEnvVar(360).some
        )
      )
    ),
    deployConf = List(
      ApiReplicaCountConf(default = 1, envOverride   = ApiIntEnvOverride(dev = None, stage = 2.some, prod = 3.some).some),
      ApiRamMegabytesConf(default = 512, envOverride = ApiIntEnvOverride(dev = None, stage = None, prod = 1024.some).some),
      ApiCpuRequestConf(default   = 200, envOverride = ApiIntEnvOverride(dev = 100.some, stage = None, prod = 500.some).some)
    ),
    version = IntVersion(0)
  )
  def toApiModel(resp: Response[String]): Task[ApiApplication] =
    Task
      .fromEither(parse(resp.body).flatMap(_.as[ApiApplication]))
      .tapError(err => ZIO(logger.error(resp.body + err.toString)))
  def toApiModelList(resp: Response[String]): Task[List[ApiApplication]] =
    Task
      .fromEither(parse(resp.body).flatMap(_.as[List[ApiApplication]]))
      .tapError(err => ZIO(logger.error(resp.body + err.toString)))

}
