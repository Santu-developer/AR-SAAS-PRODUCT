package com.armenu.auth.mapper;

import com.armenu.auth.dto.response.UserDto;
import com.armenu.auth.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
}