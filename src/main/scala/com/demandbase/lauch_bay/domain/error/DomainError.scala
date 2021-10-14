package com.demandbase.lauch_bay.domain.error

import com.demandbase.lauch_bay.domain.types.AppId

trait DomainError extends Throwable
case class ApplicationCreateFailed(id: AppId) extends DomainError {
  override def getMessage: String = s"application $id create failed as already exists"
}
