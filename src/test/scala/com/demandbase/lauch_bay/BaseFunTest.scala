package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.config.MainConfig
import com.demandbase.lauch_bay.route.middleware.ServerOptionsServiceLive
import com.demandbase.lauch_bay.route.{ApplicationsRouteServiceLive, GlobalConfigRouteServiceLive, ProjectsRouteServiceLive}
import com.demandbase.lauch_bay.service.{ApplicationServiceLive, GlobalConfigServiceLive, ProjectsServiceLive}
import org.slf4j.{Logger, LoggerFactory}
import org.testcontainers.containers.localstack.{LocalStackContainer => JavaLocalStackContainer}
import software.amazon.awssdk.services.s3.model.S3Exception
import sttp.capabilities.WebSockets
import sttp.capabilities.zio.ZioStreams
import sttp.client3.quick.quickRequest
import sttp.client3.{Empty, RequestT, SttpBackend}
import zhttp.service.EventLoopGroup
import zhttp.service.server.ServerChannelFactory
import zio.blocking.Blocking
import zio.duration.durationInt
import zio.metrics.prometheus.Registry
import zio.s3.providers.const
import zio.s3._
import zio.test.{DefaultRunnableSpec, TestAspect}
import zio.{Has, Schedule, Task, ZEnv, ZIO, ZLayer}

trait BaseFunTest extends DefaultRunnableSpec {

  type Backend = SttpBackend[Task, ZioStreams with WebSockets]
  val logger: Logger                  = LoggerFactory.getLogger(this.getClass)
  val c: RequestT[Empty, String, Any] = quickRequest

  val s3Layer: ZLayer[Has[MainConfig] with Blocking , Nothing, S3] =
    ZLayer.fromFunctionManaged {
      config =>
        (for {
          container <- TestContainer.localStackS3().provide(config)
          uri = container.endpointOverride(JavaLocalStackContainer.Service.S3)
          s3 <- Live.connect(
            S3Region.unsafeFromString(config.get.storage.region),
            const(config.get.storage.accessKeyId, config.get.storage.secretAccessKey),
            Some(uri)
          )
        } yield s3).orDie
    }

  // format: off
  val testLayer =
    // common layers
    ZEnv.live >+> MainConfig.live >+> Registry.live >+>
    // service layers
    s3Layer >+> GlobalConfigServiceLive.layer >+> ProjectsServiceLive.layer >+> ApplicationServiceLive.layer >+>
    // routes access service layers
    GlobalConfigRouteServiceLive.layer >+> ProjectsRouteServiceLive.layer >+> ApplicationsRouteServiceLive.layer >+>
    // zio-http layers
    ServerOptionsServiceLive.layer >+> EventLoopGroup.auto() >+> ServerChannelFactory.auto
    // format: on

  def clearS3(): ZIO[S3 with Has[MainConfig], S3Exception, Unit] = for {
    testBucket <- ZIO.access[Has[MainConfig]](_.get.storage.bucketName)
    isExist    <- isBucketExists(testBucket)
    _ <- if (isExist) {
           for {
             objects <- listObjects(testBucket)
             _       <- ZIO.collectAllPar(objects.objectSummaries.map(s => deleteObject(s.bucketName, s.key)))
           } yield ()
         } else createBucket(testBucket)
  } yield ()

  // zio tests, even from sbt don't await when previous test close all resources, so start and failed to bind address
  private val retryScheduler = Schedule.exponential(100.millis) && Schedule.recurs(0)
  override def aspects: List[TestAspect[Nothing, _root_.zio.test.environment.TestEnvironment, Nothing, Any]] =
    List(TestAspect.timeoutWarning(120.seconds), TestAspect.timeout(120.seconds), TestAspect.sequential, TestAspect.retry(retryScheduler))

}
