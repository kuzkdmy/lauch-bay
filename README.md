#### Launch Bay

Now this is management for applications public configs/environment variables 


#### Core libraries used

- [zio](https://zio.dev/)
- [zio-http](https://dream11.github.io/zio-http/)
- [tapir](https://tapir.softwaremill.com/en/latest/index.html)
- [tofu](https://docs.tofu.tf/docs/start.html)

#### How to check work(test/run)

[application swagger docs](http://localhost:8193/docs)


#### Bonus level programming

- `x-request-id` middleware
- MDC logging with `x-request-id` <br>
  (wait for ZIO2, if ZIO.log(...) will be able to work with some context)

#### TODO
- prometheus metrics export endpoint(enrich docker-compose with grafana and prometheus)
- api converters from api to domain classes should convert to ZIO[_ , ValidationError, T] (maybe `wix accord`, but they
  don't work by F[_])
- check how tapir works when there will be > 22 filters, they are tuples
