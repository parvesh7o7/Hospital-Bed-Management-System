function classify_severity(o2_sat, respiratory_rate, has_comorbidities, age, temp, altered_consciousness, hemodynamic_instability, require_respiratory_support) {
    //as per the guidelines of indian government(much basic) [V1.0]
    if (altered_consciousness || hemodynamic_instability || require_respiratory_support) {
        return 'ICU';
    }

    if (o2_sat < 88) {
        return 'ICU';
    }

    if (respiratory_rate > 25) {
        return 'ICU';
    }

    if (temp > 39 && respiratory_rate > 24) {
        return 'ICU';
    }

    if (age > 65 && has_comorbidities) {
        return 'ICU';
    }

    if (o2_sat > 95 && respiratory_rate < 20) {
        return 'Monitor';
    }

    return 'Ward';

}

export { classify_severity };