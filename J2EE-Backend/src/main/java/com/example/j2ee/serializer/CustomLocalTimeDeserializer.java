package com.example.j2ee.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class CustomLocalTimeDeserializer extends JsonDeserializer<LocalTime> {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public LocalTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String timeString = p.getText();
        if (timeString == null || timeString.trim().isEmpty()) {
            return null;
        }

        try {
            // Try parsing with HH:mm format first
            return LocalTime.parse(timeString, TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                // If that fails, try ISO_LOCAL_TIME format (HH:mm:ss)
                return LocalTime.parse(timeString);
            } catch (DateTimeParseException ex) {
                throw new IOException("Unable to parse time: " + timeString +
                    ". Expected format: HH:mm or HH:mm:ss", ex);
            }
        }
    }
}