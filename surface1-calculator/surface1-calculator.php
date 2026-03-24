<?php
/**
 * Plugin Name: Surface 1 Product Calculator
 * Description: Sport court resurfacing product calculator. Use shortcode [surface1_calculator] on any page.
 * Version: 1.1.0
 * Author: Surface 1
 */

if (!defined('ABSPATH')) exit;

function s1calc_enqueue_assets() {
    global $post;
    if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'surface1_calculator')) {
        return;
    }
    wp_enqueue_style(
        's1calc-styles',
        plugin_dir_url(__FILE__) . 'css/surface1-calculator.css',
        array(),
        '1.1.0'
    );
    wp_enqueue_script(
        's1calc-script',
        plugin_dir_url(__FILE__) . 'js/surface1-calculator.js',
        array(),
        '1.1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 's1calc_enqueue_assets');

function s1calc_shortcode($atts) {
    $plugin_url = esc_url(plugin_dir_url(__FILE__));
    ob_start();
    ?>
    <div id="s1calc-app" class="s1calc">
      <div class="s1calc-container">
        <!-- Step 1: Surface -->
        <section class="card" aria-label="Surface">
          <h2>Step 1: Surface</h2>
          <div class="form-row">
            <label>
              <span>Surface / Base Type</span>
              <select id="s1calc-surfaceType">
                <option value="concrete">New Concrete</option>
                <option value="asphalt">New Asphalt</option>
                <option value="existingConcrete">Existing Concrete</option>
                <option value="existingAsphalt">Existing Asphalt</option>
              </select>
            </label>
          </div>
        </section>

        <!-- Step 2: Court Entries -->
        <section class="card" aria-label="Court Entries">
          <h2>Step 2: Add Courts</h2>
          <p class="step-hint">Add court types, set dimensions, and choose zone colors.</p>
          <div id="s1calc-courtEntriesContainer"></div>
          <button id="s1calc-addCourtBtn" class="btn-add">+ Add Court</button>
        </section>

        <!-- Project Summary -->
        <section class="card" aria-label="Summary">
          <h2>Project Summary</h2>
          <div id="s1calc-summaryGrid" class="summary-grid"></div>
        </section>

        <!-- Zone Area Breakdown -->
        <section class="card" aria-label="Zone Areas">
          <h2>Zone Area Breakdown</h2>
          <table>
            <thead>
              <tr><th>Court</th><th>Zone</th><th>Square Feet</th><th>Square Yards</th></tr>
            </thead>
            <tbody id="s1calc-zoneAreasBody"></tbody>
          </table>
        </section>

        <!-- Crack Filler -->
        <section class="card hidden" id="s1calc-crackFillerSection" aria-label="Crack Filler">
          <h2>Crack Filler Estimates</h2>
          <p class="disclaimer">Coverage rates may vary depending on width and depth of the cracks.</p>
          <table>
            <thead>
              <tr><th>Product</th><th>Recommended Width</th><th>Material Totals</th></tr>
            </thead>
            <tbody id="s1calc-crackBody"></tbody>
          </table>
        </section>

        <!-- Total Area Materials -->
        <section class="card" aria-label="Total Area Materials">
          <h2>Total Area Materials (Resurfacer)</h2>
          <table>
            <thead>
              <tr><th>Material</th><th>Coats</th><th>Gallons Needed</th><th>Material Totals</th></tr>
            </thead>
            <tbody id="s1calc-totalAreaBody"></tbody>
          </table>
        </section>

        <!-- Zone Product Options -->
        <section class="card" aria-label="Zone Products">
          <h2>Court Zone Product Options</h2>
          <table>
            <thead>
              <tr><th>Material</th><th>Coats</th><th>Gallons Needed</th><th>Material Totals</th></tr>
            </thead>
            <tbody id="s1calc-zoneProductsBody"></tbody>
          </table>
        </section>

        <!-- Striping -->
        <section class="card" aria-label="Striping">
          <h2>Striping</h2>
          <table>
            <thead>
              <tr><th>Material</th><th>Gallons Needed</th><th>Material Totals</th></tr>
            </thead>
            <tbody id="s1calc-stripingBody"></tbody>
          </table>
        </section>
      </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('surface1_calculator', 's1calc_shortcode');
