function getAppointments() {
  return window.parabosStorage.safeGet(window.parabosStorage.KEYS.APPOINTMENTS, []);
}

function saveAppointment(data) {
  const appointments = getAppointments();
  const id = `APT-${Date.now()}`;
  const newAppointment = { ...data, id, status: 'REQUESTED' };
  appointments.push(newAppointment);
  window.parabosStorage.safeSet(window.parabosStorage.KEYS.APPOINTMENTS, appointments);
  return newAppointment;
}

function getCommissions() {
  return window.parabosStorage.safeGet(window.parabosStorage.KEYS.COMMISSIONS, []);
}

function saveCommission(data) {
  const commissions = getCommissions();
  const id = `COM-${Date.now()}`;
  const newCommission = { ...data, id, status: 'REQUESTED' };
  commissions.push(newCommission);
  window.parabosStorage.safeSet(window.parabosStorage.KEYS.COMMISSIONS, commissions);
  return newCommission;
}

window.appointmentsAPI = {
  getAppointments, saveAppointment, getCommissions, saveCommission
};
