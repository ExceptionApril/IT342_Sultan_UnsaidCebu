package edu.cit.sultan.unsaidcebu.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatNio2Customizer() {
        // Use NIO2 (IOCP on Windows) instead of NIO (which needs PipeImpl/WEPoll
        // that fails on this machine due to Unix Domain Socket limitations).
        return factory -> factory.setProtocol("org.apache.coyote.http11.Http11Nio2Protocol");
    }
}
