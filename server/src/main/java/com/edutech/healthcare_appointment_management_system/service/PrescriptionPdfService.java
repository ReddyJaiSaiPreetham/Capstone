package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.entity.PrescriptionItem;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PrescriptionPdfService {

    public byte[] generatePrescriptionPdf(MedicalRecord record) {
        if (record == null) {
            throw new RuntimeException("Medical record is required");
        }

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float margin = 40;
            float y = page.getMediaBox().getHeight() - margin;

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {

                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                y = writeLine(content, "Medicare Hospitals", margin, y);

                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                y = writeLine(content, "PRESCRIPTION / MEDICAL RECORD", margin, y - 8);


                y -= 10;
                content.moveTo(margin, y);
                content.lineTo(page.getMediaBox().getWidth() - margin, y);
                content.stroke();
                y -= 18;

                
                content.setFont(PDType1Font.HELVETICA, 11);

                String patientName = (record.getPatient() != null) ? record.getPatient().getUsername() : "N/A";
                String patientEmail = (record.getPatient() != null) ? record.getPatient().getEmail() : "N/A";
                String doctorName = (record.getDoctor() != null) ? record.getDoctor().getUsername() : "N/A";

                String dateStr = (record.getRecordDate() != null)
                        ? record.getRecordDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                        : "N/A";

                y = writeLine(content, "Patient Name : " + patientName, margin, y);
                y = writeLine(content, "Patient Email: " + patientEmail, margin, y);
                y = writeLine(content, "Doctor Name  : " + doctorName, margin, y);
                y = writeLine(content, "Record Date  : " + dateStr, margin, y);

                y -= 10;

                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                y = writeLine(content, "Diagnosis", margin, y);

                content.setFont(PDType1Font.HELVETICA, 11);
                y = writeWrapped(content, safe(record.getDiagnosis()), margin, y, 520);

                y -= 8;

                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                y = writeLine(content, "Treatment / Notes", margin, y);

                content.setFont(PDType1Font.HELVETICA, 11);
                y = writeWrapped(content, safe(record.getTreatment()), margin, y, 520);

                y -= 14;

                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                y = writeLine(content, "Prescription Medicines", margin, y);

                y -= 8;
                content.setFont(PDType1Font.HELVETICA_BOLD, 10);

                float tableX = margin;
                float tableWidth = page.getMediaBox().getWidth() - (2 * margin);

                float col1 = 140; 
                float col2 = 70;  
                float col3 = 70;  
                float col4 = 40;  
                float col5 = tableWidth - (col1 + col2 + col3 + col4); 

                y = drawTableRow(content, y, tableX, col1, col2, col3, col4, col5,
                        "Medicine", "Dosage", "Freq", "Days", "Instructions", true);

                content.setFont(PDType1Font.HELVETICA, 10);

                List<PrescriptionItem> items = record.getPrescriptionItems();
                if (items == null || items.isEmpty()) {
                    y = drawSingleRow(content, y, tableX, tableWidth, "No medicines added.");
                } else {
                    for (PrescriptionItem p : items) {
                        y = drawTableRow(content, y, tableX, col1, col2, col3, col4, col5,
                                safe(p.getMedicineName()),
                                safe(p.getDosage()),
                                safe(p.getFrequency()),
                                p.getDays() != null ? String.valueOf(p.getDays()) : "",
                                safe(p.getInstructions()),
                                false);

                        if (y < 80) {
                            content.endText();
                            break;
                        }
                    }
                }

                y -= 18;

                content.setFont(PDType1Font.HELVETICA_OBLIQUE, 9);
                writeLine(content, "Generated by Medicare Hospital - For hospital use only", margin, y);
            }

            document.save(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }


    private String safe(String s) {
        return (s == null) ? "" : s.trim();
    }

    private float writeLine(PDPageContentStream content, String text, float x, float y) throws IOException {
        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(text == null ? "" : text);
        content.endText();
        return y - 16;
    }

    private float writeWrapped(PDPageContentStream content, String text, float x, float y, float maxWidth) throws IOException {
        if (text == null || text.isEmpty()) {
            return writeLine(content, "-", x, y);
        }

        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();

        for (String word : words) {
            String test = line.length() == 0 ? word : (line + " " + word);

            float size = 11;
            float width = PDType1Font.HELVETICA.getStringWidth(test) / 1000 * size;

            if (width > maxWidth) {
                y = writeLine(content, line.toString(), x, y);
                line = new StringBuilder(word);
            } else {
                line = new StringBuilder(test);
            }
        }

        if (line.length() > 0) {
            y = writeLine(content, line.toString(), x, y);
        }
        return y;
    }

    private float drawTableRow(PDPageContentStream content, float y, float x,
                               float c1, float c2, float c3, float c4, float c5,
                               String v1, String v2, String v3, String v4, String v5,
                               boolean header) throws IOException {

        float rowHeight = 18;

        content.addRect(x, y - rowHeight, c1 + c2 + c3 + c4 + c5, rowHeight);
        content.stroke();

        float vx = x;
        vx += c1; content.moveTo(vx, y); content.lineTo(vx, y - rowHeight);
        vx += c2; content.moveTo(vx, y); content.lineTo(vx, y - rowHeight);
        vx += c3; content.moveTo(vx, y); content.lineTo(vx, y - rowHeight);
        vx += c4; content.moveTo(vx, y); content.lineTo(vx, y - rowHeight);
        content.stroke();

        float textY = y - 13;
        content.beginText();
        content.newLineAtOffset(x + 4, textY);
        content.showText(trimTo(v1, 22));
        content.endText();

        content.beginText();
        content.newLineAtOffset(x + c1 + 4, textY);
        content.showText(trimTo(v2, 10));
        content.endText();

        content.beginText();
        content.newLineAtOffset(x + c1 + c2 + 4, textY);
        content.showText(trimTo(v3, 10));
        content.endText();

        content.beginText();
        content.newLineAtOffset(x + c1 + c2 + c3 + 4, textY);
        content.showText(trimTo(v4, 4));
        content.endText();

        content.beginText();
        content.newLineAtOffset(x + c1 + c2 + c3 + c4 + 4, textY);
        content.showText(trimTo(v5, 28));
        content.endText();

        return y - rowHeight;
    }

    private float drawSingleRow(PDPageContentStream content, float y, float x, float width, String msg) throws IOException {
        float rowHeight = 18;
        content.addRect(x, y - rowHeight, width, rowHeight);
        content.stroke();

        content.beginText();
        content.newLineAtOffset(x + 4, y - 13);
        content.showText(msg);
        content.endText();

        return y - rowHeight;
    }

    private String trimTo(String s, int max) {
        String v = (s == null) ? "" : s;
        if (v.length() <= max) return v;
        return v.substring(0, max - 3) + "...";
    }
}