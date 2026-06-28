#pragma once

#include <concepts>
#include <stdexcept>
#include <string>
#include <utility>
#include <variant>

namespace sentinel {

struct Error
{
    std::string message;
    int code = 0;

    constexpr bool operator==(const Error&) const = default;
};

template <typename E>
class Unexpected
{
public:
    constexpr explicit Unexpected(const E& error) : error_(error) {}
    constexpr explicit Unexpected(E&& error) noexcept(std::is_nothrow_move_constructible_v<E>)
        : error_{std::move(error)}
    {
    }

    constexpr const E& error() const& noexcept { return error_; }
    constexpr E& error() & noexcept { return error_; }
    constexpr const E&& error() const&& noexcept { return std::move(error_); }
    constexpr E&& error() && noexcept { return std::move(error_); }

private:
    E error_;
};

template <typename E>
Unexpected(E) -> Unexpected<E>;

template <typename T, typename E = Error>
class Expected
{
public:
    using value_type = T;
    using error_type = E;

    constexpr Expected(const T& val) : data_(val) {}
    constexpr Expected(T&& val) noexcept(std::is_nothrow_move_constructible_v<T>)
        : data_(std::move(val))
    {
    }

    constexpr Expected(const Unexpected<E>& unexp) : data_(unexp.error()) {}
    constexpr Expected(Unexpected<E>&& unexp) noexcept(std::is_nothrow_move_constructible_v<E>)
        : data_(std::move(unexp.error()))
    {
    }

    constexpr bool has_value() const noexcept { return data_.index() == 0; }
    constexpr explicit operator bool() const noexcept { return has_value(); }

    constexpr const T& value() const&
    {
        if (!has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<0>(data_);
    }

    constexpr T& value() &
    {
        if (!has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<0>(data_);
    }

    constexpr const T&& value() const&&
    {
        if (!has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<0>(std::move(data_));
    }

    constexpr T&& value() &&
    {
        if (!has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<0>(std::move(data_));
    }

    constexpr const E& error() const&
    {
        if (has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<1>(data_);
    }

    constexpr E& error() &
    {
        if (has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<1>(data_);
    }

    constexpr const T& operator*() const& { return value(); }
    constexpr T& operator*() & { return value(); }
    constexpr const T* operator->() const { return &value(); }
    constexpr T* operator->() { return &value(); }

private:
    std::variant<T, E> data_;
};

template <typename E>
class Expected<void, E>
{
public:
    using value_type = void;
    using error_type = E;

    constexpr Expected() noexcept : data_(std::monostate{}) {}
    constexpr Expected(const Unexpected<E>& unexp) : data_(unexp.error()) {}
    constexpr Expected(Unexpected<E>&& unexp) noexcept(std::is_nothrow_move_constructible_v<E>)
        : data_(std::move(unexp.error()))
    {
    }

    constexpr bool has_value() const noexcept { return data_.index() == 0; }
    constexpr explicit operator bool() const noexcept { return has_value(); }

    constexpr void value() const
    {
        if (!has_value()) {
            throw std::bad_variant_access();
        }
    }

    constexpr const E& error() const&
    {
        if (has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<1>(data_);
    }

    constexpr E& error() &
    {
        if (has_value()) {
            throw std::bad_variant_access();
        }
        return std::get<1>(data_);
    }

private:
    std::variant<std::monostate, E> data_;
};

}  // namespace sentinel
