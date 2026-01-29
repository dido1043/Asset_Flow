package org.af.assetflowapi.data.dto.AI;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import java.io.IOException;
import java.util.Date;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiResponseDto {
    private String model;
    private String remote_model;
    private String remote_host;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Date created_at;
    private String response;
    private String thinking;
    private Boolean done;
    private String done_reason;
    private Long total_duration;
    private Integer prompt_eval_count;
    private Integer eval_count;

}
