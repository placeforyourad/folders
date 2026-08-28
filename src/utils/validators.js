const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
}

function isValidUuid(value) {
    return typeof value === "string" && UUID_REGEX.test(value);
}

export { isNonEmptyString, isValidUuid };
