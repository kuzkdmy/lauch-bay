package com.demandbase.lauch_bay.service

import cats.implicits.toShow
import com.demandbase.lauch_bay.domain.GlobalConfigDetails
import com.demandbase.lauch_bay.domain.types.IntVersion
import com.demandbase.lauch_bay.trace.{Ctx, log}
import org.slf4j.LoggerFactory
import zio._

trait GlobalConfigService {
  def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): Task[GlobalConfigDetails]
  def get()(implicit ctx: Ctx): Task[GlobalConfigDetails]
}
object GlobalConfigService extends Accessible[GlobalConfigService]

case class GlobalConfigServiceLive(ref: Ref[GlobalConfigDetails]) extends GlobalConfigService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): Task[GlobalConfigDetails] = {
    for {
      _ <- ref.update(_ => cmd)
      _ <- log.info(s"upsert global config ${cmd.show}")
    } yield cmd
  }
  override def get()(implicit ctx: Ctx): Task[GlobalConfigDetails] = {
    ref.get
  }
}

object GlobalConfigServiceLive {
  val layer = (for {
    ref <- Ref.makeManaged(GlobalConfigDetails(List.empty, List.empty, IntVersion(0)))
  } yield GlobalConfigServiceLive(ref)).toLayer[GlobalConfigService]
}
