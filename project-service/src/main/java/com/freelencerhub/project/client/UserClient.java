package com.freelencerhub.project.client;

import com.freelencerhub.project.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "auth-service")
public interface UserClient {

    @GetMapping("/auth/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/auth/users")
    List<UserDTO> getAllUsers();
}
