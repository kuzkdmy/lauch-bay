import com.typesafe.sbt.SbtNativePackager.autoImport.packageName
import com.typesafe.sbt.packager.docker.DockerPlugin
import com.typesafe.sbt.packager.docker.DockerPlugin.autoImport.{Docker, dockerBaseImage, dockerExposedPorts}
import sbt.Keys._
import sbt._

object AutoPluginDockerPublish extends AutoPlugin {
  override def trigger  = allRequirements
  override def requires = DockerPlugin
  override def projectSettings: Seq[Def.Setting[_]] =
    Seq(
      dockerBaseImage := sys.props.getOrElse("DOCKER_BASE_IMAGE", "openjdk:11"),
      dockerExposedPorts ++= Seq(9000),
      Docker / packageName := sys.props.getOrElse("DOCKER_IMAGE", s"tools/${name.value}"),
      Docker / version := sys.props.getOrElse("DOCKER_TAG", "latest")
    )
}
