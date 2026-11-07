
package Food.bridge.dto;

public class DonorResponse {

    private Integer donorId;
    private String name;
    private String email;
    private String phone;
    private String address;

    public DonorResponse(Integer donorId, String name, String email,
                         String phone, String address) {
        this.donorId = donorId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    public Integer getDonorId() {
        return donorId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }
}

