package com.demandbase.lauch_bay.service

import cats.implicits.{catsSyntaxOptionId, toShow}
import com.demandbase.lauch_bay.domain.ProjectConfigDetails
import com.demandbase.lauch_bay.domain.filter.ListProjectsFilter
import com.demandbase.lauch_bay.domain.types.ProjectId
import com.demandbase.lauch_bay.trace.{Ctx, log}
import org.slf4j.LoggerFactory
import zio._

trait ProjectsService {
  def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): Task[ProjectConfigDetails]
  def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]]
  def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]]
  def delete(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]]
}
object ProjectsService extends Accessible[ProjectsService]

case class ProjectsServiceLive(ref: Ref[Map[ProjectId, ProjectConfigDetails]]) extends ProjectsService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): Task[ProjectConfigDetails] = {
    for {
      _ <- ref.update(_ + (cmd.id -> cmd))
      _ <- log.info(s"upsert project ${cmd.show}")
    } yield cmd
  }
  override def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]] = {
    ref.get.map(_.get(id))
  }
  override def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]] = {
    for {
      data <- ref.get
      res <- ZIO.succeed {
               val idsF = filter.ids.map(_.toList.toSet)
               data.values.toList
                 .flatMap(t => if (idsF.forall(_.contains(t.id))) t.some else None)
             }
    } yield res.sortBy(_.name.value).take(filter.limit.map(_.value).getOrElse(res.size))
  }
  override def delete(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]] = {
    for {
      res <- ref.get.map(_.get(id))
      _   <- ZIO.when(res.nonEmpty)(log.info(s"deleted project: ${res.get.show}"))
      _   <- ref.update(_ - id)
    } yield res
  }
}

object ProjectsServiceLive {
  val layer = (for {
    ref <- Ref.makeManaged(Map.empty[ProjectId, ProjectConfigDetails])
  } yield ProjectsServiceLive(ref)).toLayer[ProjectsService]
}
