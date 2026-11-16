-- Accept international phone numbers (E.164 digits without "+"), e.g. villa guests with +61 / +44 numbers.
alter table bookings drop constraint if exists bookings_phone_check;
alter table bookings add constraint bookings_phone_check check (phone ~ '^[1-9][0-9]{7,14}$');
