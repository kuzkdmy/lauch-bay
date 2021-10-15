package com.demandbase.lauch_bay.domain.error

trait DomainError extends Throwable
case class EntryModifiedError(entryName: String) extends DomainError {
  override def getMessage: String = s"version of $entryName changed"
}
