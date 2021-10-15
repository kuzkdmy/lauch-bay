package com.demandbase.lauch_bay.domain

import derevo.cats.{order, show}
import derevo.circe.{decoder, encoder}
import derevo.derive
import io.estatico.newtype.macros.newtype
import sttp.tapir.derevo.schema

object types {
  @derive(show, order, schema, encoder, decoder) @newtype case class ProjectId(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class ProjectName(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class AppId(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class AppName(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class AppEnv(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class EnvVarKey(value: String)
  @derive(show, order, schema, encoder, decoder) @newtype case class IntVersion(value: Int)
  @derive(show, order, schema, encoder, decoder) @newtype case class QueryLimit(value: Int)

  implicit class IntVersionExt(intVersion: IntVersion) {
    def inc: IntVersion = IntVersion(intVersion.value + 1)
  }
}
