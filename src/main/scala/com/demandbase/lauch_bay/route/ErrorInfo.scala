package com.demandbase.lauch_bay.route

import derevo.circe.{decoder, encoder}
import derevo.derive
import sttp.tapir.derevo.schema

@derive(schema, encoder, decoder) sealed trait ErrorInfo
@derive(schema, encoder, decoder) case class NotFound(message: String) extends ErrorInfo
@derive(schema, encoder, decoder) case class Conflict(message: String) extends ErrorInfo
@derive(schema, encoder, decoder) case object NoContent extends ErrorInfo
