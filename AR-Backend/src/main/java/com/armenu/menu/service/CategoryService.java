package com.armenu.menu.service;

import com.armenu.menu.dto.request.CategoryRequest;
import com.armenu.menu.dto.response.CategoryDto;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<CategoryDto> getAll();

    CategoryDto create(CategoryRequest request);

    CategoryDto update(UUID id, CategoryRequest request);

    void delete(UUID id);
}
