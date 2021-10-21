package com.demandbase.lauch_bay

import com.demandbase.lauch_bay.config.MainConfig
import org.slf4j.{Logger, LoggerFactory}
import software.amazon.awssdk.services.s3.model.S3Exception
import sttp.capabilities.WebSockets
import sttp.capabilities.zio.ZioStreams
import sttp.client3.quick.quickRequest
import sttp.client3.{Empty, RequestT, SttpBackend}
import zio.duration.durationInt
import zio.s3.{S3, createBucket, deleteObject, isBucketExists, listObjects}
import zio.test.{DefaultRunnableSpec, TestAspect}
import zio.{Has, Schedule, Task, ZIO}

trait BaseFunTest extends DefaultRunnableSpec {

  type Backend = SttpBackend[Task, ZioStreams with WebSockets]
  val logger: Logger                  = LoggerFactory.getLogger(this.getClass)
  val c: RequestT[Empty, String, Any] = quickRequest

  def clearS3(): ZIO[S3 with Has[MainConfig], S3Exception, Unit] = for {
    testBucket <- ZIO.access[Has[MainConfig]](_.get.storage.bucketName)
    isExist <- isBucketExists(testBucket)
    _ <- if (isExist) {
      for {
        objects <- listObjects(testBucket)
        _ <- ZIO.collectAllPar(objects.objectSummaries.map(s => deleteObject(s.bucketName, s.key)))
      } yield ()
    } else createBucket("config-store")
  } yield ()

  // zio tests, even from sbt don't await when previous test close all resources, so start and failed to bind address
  private val retryScheduler = Schedule.exponential(100.millis) && Schedule.recurs(0)
  override def aspects: List[TestAspect[Nothing, _root_.zio.test.environment.TestEnvironment, Nothing, Any]] =
    List(TestAspect.timeoutWarning(10.seconds), TestAspect.timeout(20.seconds), TestAspect.sequential, TestAspect.retry(retryScheduler))

}
