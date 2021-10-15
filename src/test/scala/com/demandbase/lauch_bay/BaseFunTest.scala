package com.demandbase.lauch_bay

import org.slf4j.{Logger, LoggerFactory}
import sttp.capabilities.WebSockets
import sttp.capabilities.zio.ZioStreams
import sttp.client3.quick.quickRequest
import sttp.client3.{Empty, RequestT, SttpBackend}
import zio.Task
import zio.duration.durationInt
import zio.test.{DefaultRunnableSpec, TestAspect}

trait BaseFunTest extends DefaultRunnableSpec {

  type Backend = SttpBackend[Task, ZioStreams with WebSockets]
  val logger: Logger                  = LoggerFactory.getLogger(this.getClass)
  val c: RequestT[Empty, String, Any] = quickRequest

  // zio tests, even from sbt don't await when previous test close all resources, so start and failed to bind address
//  private val retryScheduler = Schedule.exponential(1.seconds) && Schedule.recurs(5)
  override def aspects: List[TestAspect[Nothing, _root_.zio.test.environment.TestEnvironment, Nothing, Any]] =
    List(TestAspect.timeoutWarning(10.seconds), TestAspect.timeout(20.seconds), TestAspect.sequential)

}
