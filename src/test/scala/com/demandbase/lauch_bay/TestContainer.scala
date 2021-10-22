package com.demandbase.lauch_bay

import com.dimafeng.testcontainers.LocalStackV2Container
import org.testcontainers.containers.BindMode
import org.testcontainers.containers.localstack.{LocalStackContainer => JavaLocalStackContainer}
import zio.ZManaged
import zio.blocking.{Blocking, effectBlocking}

object TestContainer {

  def localStackS3(): ZManaged[Blocking, Throwable, LocalStackV2Container] =
    ZManaged.make {
      effectBlocking {
        val container = LocalStackV2Container(services = Seq(JavaLocalStackContainer.Service.S3))
        container.container.addEnv("AWS_DEFAULT_REGION", "us-east-1")
        container.container.addEnv("EDGE_PORT", "4566")
        container.container.addFileSystemBind("/tmp/localstack", "/tmp/localstack", BindMode.READ_WRITE)
        container.start()
        container
      }
    }(container => effectBlocking(container.stop()).orDie)
}
