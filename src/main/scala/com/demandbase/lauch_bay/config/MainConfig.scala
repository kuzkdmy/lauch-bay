package com.demandbase.lauch_bay.config

import zio.{Has, TaskLayer, ZIO}

import scala.util.control.NoStackTrace

case class MainConfig(server: AppHttpServerConf, storage: S3Conf)
case class AppHttpServerConf(port: Int)
case class S3Conf(host: String, bucketName: String, region: String, accessKeyId: String, secretAccessKey: String)

object MainConfig {
  import pureconfig._
  import pureconfig.generic.auto._
  val live: TaskLayer[Has[MainConfig]] = {
    ZIO
      .fromEither(ConfigSource.default.load[MainConfig])
      .foldM(
        err => ZIO.fail(new IllegalArgumentException(s"config error: $err") with NoStackTrace),
        v => ZIO(v)
      )
      .toLayer
  }
}
