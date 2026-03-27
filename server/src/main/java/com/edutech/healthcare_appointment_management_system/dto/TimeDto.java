package com.edutech.healthcare_appointment_management_system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;


public class TimeDto {

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date time;

    public TimeDto() {
    }

    public TimeDto(Date time) {
        this.time = time;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }
}