package com.demandbase.lauch_bay.service.convert

import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.dto._

object EnvVarConverter {
  def toEnvVarConf(api: ApiEnvVarConf): EnvVarConf = {
    EnvVarConf(envKey = api.envKey, default = api.default.map(toEnvVarValue), envOverride = toEnvOverride(api.envOverride))
  }
  def toApiEnvVarValue(r: EnvVarValue): ApiEnvVarValue = {
    r match {
      case StringEnvVar(value)  => ApiStringEnvVar(value)
      case BooleanEnvVar(value) => ApiBooleanEnvVar(value)
      case IntEnvVar(value)     => ApiIntEnvVar(value)
    }
  }
  def toApiStringEnvVarValue(r: EnvVarValue): ApiStringEnvVar = {
    r match {
      case StringEnvVar(value) => ApiStringEnvVar(value)
      case _: EnvVarValue =>
        println(s"Incompatible type conversion $r => is not StringEnvVar")
        throw new RuntimeException(s"Incompatible type conversion $r => is not StringEnvVar")
    }
  }
  def toApiBooleanEnvVarValue(r: EnvVarValue): ApiBooleanEnvVar = {
    r match {
      case BooleanEnvVar(value) => ApiBooleanEnvVar(value)
      case _: EnvVarValue =>
        println(s"Incompatible type conversion $r => is not BooleanEnvVar")
        throw new RuntimeException(s"Incompatible type conversion $r => is not BooleanEnvVar")
    }
  }
  def toApiIntEnvVarValue(r: EnvVarValue): ApiIntEnvVar = {
    r match {
      case IntEnvVar(value) => ApiIntEnvVar(value)
      case _: EnvVarValue =>
        println(s"Incompatible type conversion $r => is not IntEnvVar")
        throw new RuntimeException(s"Incompatible type conversion $r => is not IntEnvVar")
    }
  }
  def toEnvVarValue(api: ApiEnvVarValue): EnvVarValue = {
    api match {
      case ApiStringEnvVar(value)  => StringEnvVar(value)
      case ApiBooleanEnvVar(value) => BooleanEnvVar(value)
      case ApiIntEnvVar(value)     => IntEnvVar(value)
    }
  }
  def toApiStringEnvOverride(r: EnvOverride[EnvVarValue]): ApiStringEnvVarOverride = {
    ApiStringEnvVarOverride(dev = r.dev.map(toApiStringEnvVarValue), stage = r.stage.map(toApiStringEnvVarValue), prod = r.prod.map(toApiStringEnvVarValue))
  }
  def toApiBooleanEnvOverride(r: EnvOverride[EnvVarValue]): ApiBooleanEnvVarOverride = {
    ApiBooleanEnvVarOverride(dev = r.dev.map(toApiBooleanEnvVarValue), stage = r.stage.map(toApiBooleanEnvVarValue), prod = r.prod.map(toApiBooleanEnvVarValue))
  }
  def toApiInt2EnvOverride(r: EnvOverride[EnvVarValue]): ApiIntEnvVarOverride = {
    ApiIntEnvVarOverride(dev = r.dev.map(toApiIntEnvVarValue), stage = r.stage.map(toApiIntEnvVarValue), prod = r.prod.map(toApiIntEnvVarValue))
  }
  def toApiIntEnvOverride(r: EnvOverride[Int]): ApiIntEnvOverride = {
    ApiIntEnvOverride(dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toIntEnvOverride(r: ApiIntEnvOverride): EnvOverride[Int] = {
    EnvOverride[Int](dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toApiStringEnvOverride(r: EnvOverride[String]): ApiStringEnvOverride = {
    ApiStringEnvOverride(dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toStringEnvOverride(r: ApiStringEnvOverride): EnvOverride[String] = {
    EnvOverride[String](dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toApiBooleanEnvOverride(r: EnvOverride[Boolean]): ApiBooleanEnvOverride = {
    ApiBooleanEnvOverride(dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toBooleanEnvOverride(r: ApiBooleanEnvOverride): EnvOverride[Boolean] = {
    EnvOverride[Boolean](dev = r.dev, stage = r.stage, prod = r.prod)
  }
  def toEnvOverride(r: ApiEnvVarOverride): EnvOverride[EnvVarValue] = {
    EnvOverride[EnvVarValue](dev = r.dev.map(toEnvVarValue), stage = r.stage.map(toEnvVarValue), prod = r.prod.map(toEnvVarValue))
  }
  def toApiEnvVarConf(r: EnvVarConf): ApiEnvVarConf = {
    Seq(r.default, r.envOverride.dev, r.envOverride.stage, r.envOverride.prod).flatten.headOption
      .fold("string")(_.getClass.getSimpleName match {
        case "StringEnvVar"  => "string"
        case "BooleanEnvVar" => "boolean"
        case "IntEnvVar"     => "int"
        case _               => "string"
      }) match {
      case "string"  => ApiEnvStringVarConf(r.envKey, r.default.map(toApiStringEnvVarValue), toApiStringEnvOverride(r.envOverride))
      case "boolean" => ApiEnvBooleanVarConf(r.envKey, r.default.map(toApiBooleanEnvVarValue), toApiBooleanEnvOverride(r.envOverride))
      case "int"     => ApiEnvIntVarConf(r.envKey, r.default.map(toApiIntEnvVarValue), toApiInt2EnvOverride(r.envOverride))
    }
  }
}
