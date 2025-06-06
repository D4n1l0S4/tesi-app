package it.uniba.crud.dto;

import java.util.Map;

import it.uniba.crud.dto.pedigree.PedigreeRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Map<String, String> validationErrors;

    
    //COSTRUTTORI
    public ApiResponse() {}

    
    public ApiResponse(boolean success, String message, T data, Map<String, String> validationErrors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.validationErrors = validationErrors;
    }

    //caso in cui va tutto ok e non ci sono errori
    public ApiResponse(boolean success, String message, T data) {
        this(success, message, data, null);
    }

    //caso in cui ci sono errori nella logica di business e quindi ritorni false + messaggio
    public ApiResponse(boolean success, String message) {
        this(success, message, null, null);
    }

    //caso in cui ci sono errori durante la validazione(ciò che arriva in input al controller)
    public ApiResponse(boolean success, String message, Map<String, String> validationErrors) {
        this(success, message, null, validationErrors);
    }

    
    // Getters e Setters
    
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }

    public void setValidationErrors(Map<String, String> validationErrors) {
        this.validationErrors = validationErrors;
    }
}
