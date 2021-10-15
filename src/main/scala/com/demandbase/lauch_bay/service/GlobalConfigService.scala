package com.demandbase.lauch_bay.service

import cats.implicits.toShow
import com.demandbase.lauch_bay.domain.GlobalConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.types.IntVersion
import com.demandbase.lauch_bay.trace.{log, Ctx}
import org.slf4j.LoggerFactory
import zio._

trait GlobalConfigService {
  def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, GlobalConfigDetails]
  def get()(implicit ctx: Ctx): Task[GlobalConfigDetails]
}
object GlobalConfigService extends Accessible[GlobalConfigService]

case class GlobalConfigServiceLive(ref: Ref[GlobalConfigDetails]) extends GlobalConfigService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: GlobalConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, GlobalConfigDetails] = {
    for {
      updated <- ref.modify(cur => if (cur.version == cmd.version) (true, cmd.copy(version = cur.version.inc)) else (false, cur))
      res <- if (updated) ref.get
             else
               ref.get.flatMap { sv =>
                 log.info(s"upsert global config fail server version:[$sv], cmd version:[${cmd.version}]")
               } *> IO.fail(EntryModifiedError("Global Config"))
      _ <- log.info(s"upsert global config, new version: ${res.version}, upsert cmd: ${cmd.show}")
    } yield res
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
