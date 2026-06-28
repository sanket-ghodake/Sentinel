#pragma once

#include <cctype>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

namespace sentinel {

class Json
{
public:
    enum class Type
    {
        Null,
        Bool,
        Number,
        String,
        Array,
        Object
    };

    Json() : value_(std::monostate{}) {}
    Json(std::nullptr_t) : value_(std::monostate{}) {}
    Json(bool b) : value_(b) {}
    Json(double d) : value_(d) {}
    Json(int i) : value_(static_cast<double>(i)) {}
    Json(const std::string& s) : value_(s) {}
    Json(const char* s) : value_(std::string(s)) {}
    Json(std::vector<Json> a) : value_(a) {}
    Json(std::unordered_map<std::string, Json> o) : value_(o) {}

    Type type() const
    {
        if (std::holds_alternative<std::monostate>(value_))
            return Type::Null;
        if (std::holds_alternative<bool>(value_))
            return Type::Bool;
        if (std::holds_alternative<double>(value_))
            return Type::Number;
        if (std::holds_alternative<std::string>(value_))
            return Type::String;
        if (std::holds_alternative<std::vector<Json>>(value_))
            return Type::Array;
        return Type::Object;
    }

    bool is_null() const { return type() == Type::Null; }
    bool is_bool() const { return type() == Type::Bool; }
    bool is_number() const { return type() == Type::Number; }
    bool is_string() const { return type() == Type::String; }
    bool is_array() const { return type() == Type::Array; }
    bool is_object() const { return type() == Type::Object; }

    bool as_bool() const { return std::get<bool>(value_); }
    double as_number() const { return std::get<double>(value_); }
    const std::string& as_string() const { return std::get<std::string>(value_); }
    const std::vector<Json>& as_array() const { return std::get<std::vector<Json>>(value_); }
    const std::unordered_map<std::string, Json>& as_object() const
    {
        return std::get<std::unordered_map<std::string, Json>>(value_);
    }

    bool contains(const std::string& key) const
    {
        if (!is_object())
            return false;
        return as_object().find(key) != as_object().end();
    }

    bool get_bool(const std::string& key, bool default_val = false) const
    {
        auto it = as_object().find(key);
        if (it != as_object().end() && it->second.is_bool())
            return it->second.as_bool();
        return default_val;
    }

    std::string get_string(const std::string& key, const std::string& default_val = "") const
    {
        auto it = as_object().find(key);
        if (it != as_object().end() && it->second.is_string())
            return it->second.as_string();
        return default_val;
    }

    double get_number(const std::string& key, double default_val = 0.0) const
    {
        auto it = as_object().find(key);
        if (it != as_object().end() && it->second.is_number())
            return it->second.as_number();
        return default_val;
    }

    const Json& operator[](const std::string& key) const { return as_object().at(key); }

    const Json& operator[](size_t index) const { return as_array().at(index); }

    std::string serialize() const
    {
        std::ostringstream ss;
        serialize_to(ss);
        return ss.str();
    }

    static Json parse(const std::string& input);

private:
    void serialize_to(std::ostringstream& ss) const
    {
        switch (type()) {
            case Type::Null:
                ss << "null";
                break;
            case Type::Bool:
                ss << (as_bool() ? "true" : "false");
                break;
            case Type::Number:
                ss << as_number();
                break;
            case Type::String: {
                ss << '"';
                for (char c : as_string()) {
                    if (c == '"')
                        ss << "\\\"";
                    else if (c == '\\')
                        ss << "\\\\";
                    else if (c == '\n')
                        ss << "\\n";
                    else if (c == '\r')
                        ss << "\\r";
                    else if (c == '\t')
                        ss << "\\t";
                    else
                        ss << c;
                }
                ss << '"';
                break;
            }
            case Type::Array: {
                ss << '[';
                const auto& arr = as_array();
                for (size_t i = 0; i < arr.size(); ++i) {
                    if (i > 0)
                        ss << ',';
                    arr[i].serialize_to(ss);
                }
                ss << ']';
                break;
            }
            case Type::Object: {
                ss << '{';
                const auto& obj = as_object();
                bool first = true;
                for (const auto& [k, v] : obj) {
                    if (!first)
                        ss << ',';
                    first = false;
                    ss << '"' << k << "\":";
                    v.serialize_to(ss);
                }
                ss << '}';
                break;
            }
        }
    }

    std::variant<std::monostate,
                 bool,
                 double,
                 std::string,
                 std::vector<Json>,
                 std::unordered_map<std::string, Json>>
        value_;
};

class JsonParser
{
public:
    explicit JsonParser(const std::string& input) : input_{input}, index_{0} {}

    Json parse()
    {
        skip_whitespace();
        if (index_ >= input_.size()) {
            throw std::runtime_error("Empty input");
        }
        char c = input_[index_];
        if (c == '{')
            return parse_object();
        if (c == '[')
            return parse_array();
        if (c == '"')
            return parse_string();
        if (c == 't' || c == 'f')
            return parse_bool();
        if (c == 'n')
            return parse_null();
        if (std::isdigit(c) || c == '-' || c == '.')
            return parse_number();
        throw std::runtime_error(std::string("Unexpected character: ") + c);
    }

private:
    void skip_whitespace()
    {
        while (index_ < input_.size() && std::isspace(static_cast<unsigned char>(input_[index_]))) {
            index_++;
        }
    }

    Json parse_object()
    {
        index_++;  // '{'
        std::unordered_map<std::string, Json> obj;
        skip_whitespace();
        if (index_ < input_.size() && input_[index_] == '}') {
            index_++;
            return Json(obj);
        }
        while (true) {
            skip_whitespace();
            if (index_ >= input_.size() || input_[index_] != '"') {
                throw std::runtime_error("Expected string key in object");
            }
            std::string key = parse_string_raw();
            skip_whitespace();
            if (index_ >= input_.size() || input_[index_] != ':') {
                throw std::runtime_error("Expected ':' after object key");
            }
            index_++;  // ':'
            obj.emplace(key, parse());
            skip_whitespace();
            if (index_ >= input_.size()) {
                throw std::runtime_error("Unterminated object");
            }
            if (input_[index_] == '}') {
                index_++;
                break;
            }
            if (input_[index_] == ',') {
                index_++;
                continue;
            }
            throw std::runtime_error("Expected ',' or '}' in object");
        }
        return Json(obj);
    }

    Json parse_array()
    {
        index_++;  // '['
        std::vector<Json> arr;
        skip_whitespace();
        if (index_ < input_.size() && input_[index_] == ']') {
            index_++;
            return Json(arr);
        }
        while (true) {
            arr.push_back(parse());
            skip_whitespace();
            if (index_ >= input_.size()) {
                throw std::runtime_error("Unterminated array");
            }
            if (input_[index_] == ']') {
                index_++;
                break;
            }
            if (input_[index_] == ',') {
                index_++;
                continue;
            }
            throw std::runtime_error("Expected ',' or ']' in array");
        }
        return Json(arr);
    }

    Json parse_string() { return Json(parse_string_raw()); }

    std::string parse_string_raw()
    {
        index_++;  // '"'
        std::string s;
        while (index_ < input_.size()) {
            char c = input_[index_];
            if (c == '"') {
                index_++;
                return s;
            }
            if (c == '\\') {
                index_++;
                if (index_ >= input_.size())
                    throw std::runtime_error("Unterminated escape sequence");
                char esc = input_[index_];
                if (esc == '"')
                    s += '"';
                else if (esc == '\\')
                    s += '\\';
                else if (esc == 'n')
                    s += '\n';
                else if (esc == 'r')
                    s += '\r';
                else if (esc == 't')
                    s += '\t';
                else
                    s += esc;
            } else {
                s += c;
            }
            index_++;
        }
        throw std::runtime_error("Unterminated string");
    }

    Json parse_bool()
    {
        if (input_.compare(index_, 4, "true") == 0) {
            index_ += 4;
            return Json(true);
        }
        if (input_.compare(index_, 5, "false") == 0) {
            index_ += 5;
            return Json(false);
        }
        throw std::runtime_error("Expected boolean");
    }

    Json parse_null()
    {
        if (input_.compare(index_, 4, "null") == 0) {
            index_ += 4;
            return Json(nullptr);
        }
        throw std::runtime_error("Expected null");
    }

    Json parse_number()
    {
        size_t next;
        double d = std::stod(input_.substr(index_), &next);
        index_ += next;
        return Json(d);
    }

    const std::string& input_;
    size_t index_;
};

inline Json Json::parse(const std::string& input)
{
    return JsonParser(input).parse();
}

}  // namespace sentinel
