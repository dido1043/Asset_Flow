package org.af.assetflowapi.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProtocolServiceTest {

    @Test
    void normalizeProtocolContent_keepsRealLineBreaks() {
        String content = "I. Страни\nII. Предмет на предаване\n1. Лаптоп";

        assertEquals(content, ProtocolService.normalizeProtocolContent(content));
    }

    @Test
    void normalizeProtocolContent_convertsEscapedLineBreaks() {
        String content = "I. Страни\\nII. Предмет на предаване\\n1. Лаптоп";

        assertEquals(
                "I. Страни\nII. Предмет на предаване\n1. Лаптоп",
                ProtocolService.normalizeProtocolContent(content)
        );
    }

    @Test
    void normalizeProtocolContent_decodesQuotedJsonRequestBody() {
        String content = "\"I. Страни\\\\nII. Предмет на предаване\\\\n1. Лаптоп\"";

        assertEquals(
                "I. Страни\nII. Предмет на предаване\n1. Лаптоп",
                ProtocolService.normalizeProtocolContent(content)
        );
    }

    @Test
    void normalizeProtocolContent_repairsBareNewlineMarkersFromLegacyEdits() {
        String content = "I. СтраниnII. Предмет на предаванеn1. Лаптоп (подпис)nDaniel Petrov: ................ (подпис)";

        assertEquals(
                "I. Страни\nII. Предмет на предаване\n1. Лаптоп (подпис)\nDaniel Petrov: ................ (подпис)",
                ProtocolService.normalizeProtocolContent(content)
        );
    }

    @Test
    void normalizeProtocolContent_doesNotSplitNamesContainingN() {
        String content = "Daniel Petrov: ................ (подпис)";

        assertEquals(content, ProtocolService.normalizeProtocolContent(content));
    }
}
