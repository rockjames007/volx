package com.quad.service;

import com.quad.dto.AttendanceUpdateRequest;
import com.quad.dto.CheckInCodeDto;
import com.quad.dto.CheckInResultDto;
import com.quad.dto.HoursEntryDto;
import com.quad.dto.HoursRecordDto;
import com.quad.dto.VolunteerSignupDto;
import com.quad.security.Caller;

public interface AttendanceService {

    CheckInCodeDto getCheckInCode(String eventId, Caller organizer);

    CheckInResultDto checkIn(String eventId, String code, Caller volunteer);

    VolunteerSignupDto updateAttendance(String eventId, String username, AttendanceUpdateRequest request, Caller organizer);

    HoursRecordDto getMyHours(Caller volunteer);

    HoursEntryDto verify(String verificationCode);
}
