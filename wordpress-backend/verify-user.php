<?php
/**
 * Plugin Name: Fitness App API - Verify User
 * Description: Custom REST API endpoint to verify user subscription via PMPro and support OTP authentication.
 * Version: 1.3
 * Author: Abhimanyu Sharma
 */

// Block direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register the custom REST routes
add_action('rest_api_init', 'fitness_app_register_verify_user_route');

function fitness_app_register_verify_user_route() {
    // Legacy endpoint (might still be used or can be deprecated)
    register_rest_route('fitness-app/v1', '/verify-user', array(
        'methods'             => 'POST',
        'callback'            => 'fitness_app_verify_user_endpoint',
        'permission_callback' => 'fitness_app_verify_user_permissions_check',
        'args'                => array(
            'login_id' => array(
                'required'          => true,
                'validate_callback' => function ($param, $request, $key) {
                    return !empty($param) && is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));

    // Request OTP endpoint
    register_rest_route('fitness-app/v1', '/request-otp', array(
        'methods'             => 'POST',
        'callback'            => 'fitness_app_request_otp_endpoint',
        'permission_callback' => 'fitness_app_verify_user_permissions_check',
        'args'                => array(
            'login_id' => array(
                'required'          => true,
                'validate_callback' => function ($param, $request, $key) {
                    return !empty($param) && is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));

    // Verify OTP endpoint
    register_rest_route('fitness-app/v1', '/verify-otp', array(
        'methods'             => 'POST',
        'callback'            => 'fitness_app_verify_otp_endpoint',
        'permission_callback' => 'fitness_app_verify_user_permissions_check',
        'args'                => array(
            'login_id' => array(
                'required'          => true,
                'validate_callback' => function ($param, $request, $key) {
                    return !empty($param) && is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field'
            ),
            'otp' => array(
                'required'          => true,
                'validate_callback' => function ($param, $request, $key) {
                    return !empty($param) && is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));
}

// Basic permission check (API Key)
function fitness_app_verify_user_permissions_check($request) {
    $api_key = $request->get_header('x-fitness-api-key');
    if (!defined('FITNESS_APP_SECRET_KEY') || empty(FITNESS_APP_SECRET_KEY)) {
        return new WP_Error('rest_internal_error', 'API security key is not configured on the server.', array('status' => 500));
    }
    $expected_key = FITNESS_APP_SECRET_KEY;
    
    if (empty($api_key) || $api_key !== $expected_key) {
        return new WP_Error('rest_forbidden', 'Invalid API key.', array('status' => 401));
    }
    
    return true; 
}

// Helper function to get user ID by email or mobile
function get_fitness_app_user_by_login_id($login_id) {
    if (is_email($login_id)) {
        $user = get_user_by('email', $login_id);
        if ($user) {
            return $user->ID;
        }
    } else {
        $users = get_users(array(
            'meta_key'   => 'mobile_number',
            'meta_value' => $login_id,
            'number'     => 1, // We only need the first matched user
            'orderby'    => 'ID',
            'order'      => 'ASC'
        ));

        if (!empty($users)) {
            return $users[0]->ID;
        }
    }
    return 0;
}

// Endpoint 1: Request OTP
function fitness_app_request_otp_endpoint($request) {
    $login_id = $request->get_param('login_id');
    $user_id = get_fitness_app_user_by_login_id($login_id);

    if (!$user_id) {
        return new WP_Error('user_not_found', 'No user found with the provided email or mobile number.', array('status' => 404));
    }

    if (!function_exists('pmpro_hasMembershipLevel')) {
        return new WP_Error('pmpro_missing', 'Paid Memberships Pro plugin is not active on the server.', array('status' => 500));
    }

    if (!pmpro_hasMembershipLevel(0, $user_id)) {
        return new WP_Error('forbidden', 'User does not have an active subscription for any required level.', array('status' => 403));
    }

    // Generate 6-digit OTP securely
    try {
        $otp = sprintf("%06d", random_int(100000, 999999));
    } catch (\Exception $e) {
        // Fallback to mt_rand if random_int fails, although rare in modern PHP environments
        $otp = sprintf("%06d", mt_rand(100000, 999999));
    }
    $expires = time() + (5 * 60); // 5 minutes

    update_user_meta($user_id, '_fitness_login_otp', md5($otp));
    update_user_meta($user_id, '_fitness_login_otp_expires', $expires);

    // Send the OTP
    if (is_email($login_id)) {
        $user_obj = get_userdata($user_id);
        $first_name = $user_obj ? $user_obj->first_name : '';
        $greeting = $first_name ? "Hi " . esc_html($first_name) . "," : "Hi,";

        $subject = "Your TheSugaRoots Login Code: " . $otp;
        $message = '
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #27272a;">
    <h2 style="color: #2563eb; margin: 0 0 16px;">TheSugaRoots</h2>
    <p style="margin: 0 0 16px;">' . $greeting . '</p>
    <p style="margin: 0 0 16px;">Use this one-time code to sign in to <strong>TheSugaRoots Tools</strong>:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f5; border-radius: 12px; padding: 16px 24px; text-align: center; margin: 0 0 16px;">' . $otp . '</p>
    <p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">This code expires in 5 minutes. If you did not request it, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: #71717a;">
        TheSugaRoots &mdash; your partner in healthy living<br>
        <a href="https://thesugaroots.com/" style="color: #2563eb;">thesugaroots.com</a>
    </p>
</div>';
        $headers = array('Content-Type: text/html; charset=UTF-8');
        wp_mail($login_id, $subject, $message, $headers);
    } else {
        // Log to error_log (SMS Provider to be added here in the future)
        error_log("FITNESS APP OTP for Mobile {$login_id}: {$otp}");
    }

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'OTP generated and sent.'
    ));
}

// Endpoint 2: Verify OTP
function fitness_app_verify_otp_endpoint($request) {
    $login_id = $request->get_param('login_id');
    $otp_input = $request->get_param('otp');

    $user_id = get_fitness_app_user_by_login_id($login_id);
    if (!$user_id) {
        return new WP_Error('user_not_found', 'No user found.', array('status' => 404));
    }

    if (!function_exists('pmpro_hasMembershipLevel') || !pmpro_hasMembershipLevel(0, $user_id)) {
        return new WP_Error('forbidden', 'User does not have an active subscription.', array('status' => 403));
    }

    $stored_otp = get_user_meta($user_id, '_fitness_login_otp', true);
    $expires = get_user_meta($user_id, '_fitness_login_otp_expires', true);

    if (!$stored_otp || !$expires) {
        return new WP_Error('invalid_otp', 'No OTP requested or OTP expired.', array('status' => 400));
    }

    if (time() > $expires) {
        delete_user_meta($user_id, '_fitness_login_otp');
        delete_user_meta($user_id, '_fitness_login_otp_expires');
        return new WP_Error('otp_expired', 'Your OTP has expired. Please request a new one.', array('status' => 400));
    }

    if (md5($otp_input) !== $stored_otp) {
        return new WP_Error('invalid_otp', 'The OTP provided is incorrect.', array('status' => 400));
    }

    // OTP is valid
    delete_user_meta($user_id, '_fitness_login_otp');
    delete_user_meta($user_id, '_fitness_login_otp_expires');

    $user_obj = get_userdata($user_id);
    $all_levels = function_exists('pmpro_getMembershipLevelsForUser') ? pmpro_getMembershipLevelsForUser($user_id) : '';

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'OTP verified successfully.',
        'data'    => array(
            'user_id'      => $user_id,
            'display_name' => $user_obj->display_name,
            'email'        => $user_obj->user_email,
            'first_name'   => $user_obj->first_name,
            'last_name'    => $user_obj->last_name,
            'levels'       => $all_levels
        )
    ));
}

// Legacy Verification (Without OTP)
function fitness_app_verify_user_endpoint($request) {
    $login_id = $request->get_param('login_id');
    $user_id = get_fitness_app_user_by_login_id($login_id);

    if (!$user_id) {
        return new WP_Error('user_not_found', 'No user found with the provided email or mobile number.', array('status' => 404));
    }

    if (!function_exists('pmpro_hasMembershipLevel')) {
        return new WP_Error('pmpro_missing', 'Paid Memberships Pro plugin is not active on the server.', array('status' => 500));
    }

    $has_active_subscription = pmpro_hasMembershipLevel(0, $user_id);
    $all_levels = function_exists('pmpro_getMembershipLevelsForUser') ? pmpro_getMembershipLevelsForUser($user_id) : '';

    if ($has_active_subscription) {
        $user_obj = get_userdata($user_id);
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'User has an active subscription.',
            'data'    => array(
                'user_id'      => $user_id,
                'display_name' => $user_obj->display_name,
                'email'        => $user_obj->user_email,
                'first_name'   => $user_obj->first_name,
                'last_name'    => $user_obj->last_name,
                'levels'       => $all_levels
            )
        ));
    } else {
        return new WP_Error('forbidden', 'User does not have an active subscription for any required level.', array('status' => 403));
    }
}
